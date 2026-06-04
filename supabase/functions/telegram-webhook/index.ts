import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

interface TelegramUpdate {
  message?: {
    chat: { id: number }
    text?: string
  }
}

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const CATEGORIAS = ["Alimentación", "Transporte", "Vivienda", "Salud", "Entretenimiento", "Ingresos", "Otros"] as const

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  generationConfig: { responseMimeType: "application/json" },
})

const SYSTEM_PROMPT = `Eres un asistente financiero. Extrae la siguiente información del mensaje del usuario:
- monto: número entero (el valor numérico)
- concepto: string (descripción corta, capitalizada)
- categoria: string (estrictamente uno de: 'Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Ingresos', 'Otros')
- tipo: string ('gasto' o 'ingreso')

Si el mensaje habla de sueldo, salario, pago recibido, transferencia recibida, ingreso, remuneración: categoria 'Ingresos', tipo 'ingreso'.
Para cualquier gasto: tipo 'gasto'.

Responde ÚNICAMENTE con un JSON con esos cuatro campos. Si no puedes identificar, responde {"error": "No pude identificar"}.`

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function parsearNumeros(texto: string): number {
  const numerosPalabras: Record<string, number> = {
    un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5,
    seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  }

  const tokens = texto.toLowerCase().split(/\s+/)
  const found: { index: number; valor: number }[] = []
  const usado = new Set<number>()
  let total = 0

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (/^\d+$/.test(token) && parseInt(token) > 0) {
      found.push({ index: i, valor: parseInt(token, 10) })
    } else if (numerosPalabras[token]) {
      found.push({ index: i, valor: numerosPalabras[token] })
    }
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i] !== "cada" || (tokens[i + 1] !== "una" && tokens[i + 1] !== "uno")) continue

    let beforeIdx = -1
    for (let j = found.length - 1; j >= 0; j--) {
      if (!usado.has(j) && found[j].index < i) { beforeIdx = j; break }
    }

    let afterIdx = -1
    for (let j = 0; j < found.length; j++) {
      if (!usado.has(j) && found[j].index > i + 1) { afterIdx = j; break }
    }

    if (beforeIdx >= 0 && afterIdx >= 0) {
      usado.add(beforeIdx)
      usado.add(afterIdx)
      total += found[beforeIdx].valor * found[afterIdx].valor
    }
  }

  for (let i = 0; i < found.length; i++) {
    if (!usado.has(i)) total += found[i].valor
  }

  return total
}

function parseGastoFallback(text: string): { monto: number; concepto: string; categoria: string; tipo: string } | null {
  const monto = parsearNumeros(text)
  if (monto <= 0) return null

  const texto = text.toLowerCase()
  const esIngreso = /sueldo|salario|remuneraci[oó]n|ingreso|pago\s*(recibido|mensual|quincenal|semanal)?|transferencia\s*(recibida)?|honorario/i.test(texto)

  if (esIngreso) {
    let concepto = text.replace(/\$?\s*[\d.]+\s*/gi, "").trim()
    concepto = concepto.charAt(0).toUpperCase() + concepto.slice(1)
    if (!concepto) concepto = "Ingreso"
    return { monto, concepto, categoria: "Ingresos", tipo: "ingreso" }
  }

  const categoriaMap: [RegExp, string][] = [
    [/com[ií]|supermercado|mercado|panader[ií]a|almuerzo|desayuno|cena|carnicer[ií]a|fruta|verdura|pan|leche|huevo|comida/i, "Alimentación"],
    [/bus|micro|taxi|uber|colectivo|metro|gasolina|bencina|estacionamiento|peaje|transporte|combustible/i, "Transporte"],
    [/arriendo|renta|hipoteca|agua|luz|gas|electricidad|internet|tel[ée]fono|vivienda|departamento|casa/i, "Vivienda"],
    [/doctor|m[ée]dico|farmacia|medicina|hospital|cl[ií]nica|salud|dental|examen|remedio|pastilla/i, "Salud"],
    [/cine|netflix|spotify|juego|m[úu]sica|concierto|teatro|libro|club|helado|cerveza|bar|rest[oa]urante|entretenci[óo]n|ocio|pizza|hamburguesa|palomita/i, "Entretenimiento"],
  ]

  let categoria = "Otros"
  for (const [regex, cat] of categoriaMap) {
    if (regex.test(texto)) {
      categoria = cat
      break
    }
  }

  let concepto = text.replace(/\$?\s*[\d.]+\s*(?:cada\s*una?)?/gi, "").trim()
  const stopWords = ["compre", "compre", "pague", "pague", "gaste", "gaste", "comprar", "pagar", "gastar", "por", "de", "en", "un", "una", "unos", "unas", "el", "la", "los", "las", "con", "del", "para", "se", "me", "ayer", "hoy", "dos", "tres"]
  concepto = concepto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  concepto = concepto.replace(/\b(?:cada\s*una?)\b/gi, "").trim()
  concepto = concepto.split(/\s+/).filter(w => !stopWords.includes(w)).join(" ")
  concepto = concepto.charAt(0).toUpperCase() + concepto.slice(1)
  if (!concepto) concepto = "Gasto"

  return { monto, concepto, categoria, tipo: "gasto" }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const update: TelegramUpdate = await req.json()
    const chatId = update.message?.chat?.id
    const text = update.message?.text?.trim()

    if (!chatId || !text) {
      return new Response(JSON.stringify({ ok: false, error: "No message" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    if (text.startsWith("/start")) {
      await sendTelegramMessage(chatId,
        "👋 ¡Bienvenido a PerJaus!\n\n"
        + "Antes de registrar gastos o ingresos, vincula tu chat con tu cuenta web:\n"
        + "1. Inicia sesión en perjaus.netlify.app\n"
        + "2. Genera un código en \"Conectar Telegram\"\n"
        + "3. Envía: _/vinculate CODIGO_\n\n"
        + "Comandos:\n"
        + "/vinculate <codigo> — Vincular tu chat con tu cuenta web\n"
        + "/presupuesto <categoria> <monto> — Fijar presupuesto del mes\n"
        + "/help — Mostrar esta ayuda"
      )
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (text.startsWith("/help")) {
      await sendTelegramMessage(chatId,
        "🤖 *Comandos PerJaus:*\n\n"
        + "Envíame cualquier gasto y lo registro automáticamente.\n"
        + "Ejemplos:\n"
        + "_almuerzo 5000_\n"
        + "_sueldo 500000_\n"
        + "_taxi 3000_\n\n"
        + "/vinculate <codigo> — Vincular con tu cuenta web\n"
        + "/presupuesto <categoria> <monto> — Fijar presupuesto\n"
        + "  Ej: /presupuesto Alimentación 250000\n"
        + "/start — Mensaje de bienvenida"
      )
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (text.startsWith("/vinculate")) {
      const code = text.replace("/vinculate", "").trim()
      if (!code) {
        await sendTelegramMessage(chatId,
          "❌ Debes incluir el código. Ejemplo:\n"
          + "_/vinculate ABC123_"
        )
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { data: codeData, error: codeError } = await supabase
        .from("vinculate_codes")
        .select("user_id")
        .eq("code", code.toUpperCase())
        .gte("expires_at", new Date().toISOString())
        .single()

      if (codeError || !codeData) {
        await sendTelegramMessage(chatId,
          "❌ Código inválido o expirado. Genera uno nuevo desde la web."
        )
        return new Response(JSON.stringify({ ok: false, error: "Invalid code" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { error: linkError } = await supabase
        .from("user_telegram_links")
        .upsert(
          { user_id: codeData.user_id, telegram_chat_id: String(chatId) },
          { onConflict: "telegram_chat_id" },
        )

      if (linkError) {
        await sendTelegramMessage(chatId, "❌ Error al vincular. Intenta de nuevo.")
        return new Response(JSON.stringify({ ok: false, error: linkError }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      await supabase.from("vinculate_codes").delete().eq("code", code.toUpperCase())

      await supabase.from("gastos").update({ user_id: codeData.user_id }).eq("telegram_chat_id", String(chatId)).is("user_id", null)
      await supabase.from("ingresos").update({ user_id: codeData.user_id }).eq("telegram_chat_id", String(chatId)).is("user_id", null)

      await sendTelegramMessage(chatId,
        "✅ *¡Vinculado con éxito!*\n\n"
        + "Tus gastos e ingresos anteriores ahora están asociados a tu cuenta."
      )
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (text.startsWith("/presupuesto")) {
      const args = text.replace("/presupuesto", "").trim()
      const match = args.match(/^(.+?)\s+(\d+)$/)
      if (!match) {
        await sendTelegramMessage(chatId,
          "❌ Formato: /presupuesto <categoria> <monto>\n"
          + "Ejemplo: _/presupuesto Alimentación 250000_"
        )
        return new Response(JSON.stringify({ ok: false, error: "Invalid format" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const categoria = match[1].trim()
      const monto = parseInt(match[2], 10)

      if (!CATEGORIAS.includes(categoria as typeof CATEGORIAS[number])) {
        await sendTelegramMessage(chatId,
          `❌ Categoría inválida. Categorías: ${CATEGORIAS.filter(c => c !== "Ingresos").join(", ")}`
        )
        return new Response(JSON.stringify({ ok: false, error: "Invalid category" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const ahora = new Date()
      const mesStart = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`

      const { data: link } = await supabase
        .from("user_telegram_links")
        .select("user_id")
        .eq("telegram_chat_id", String(chatId))
        .maybeSingle()

      if (!link) {
        await sendTelegramMessage(chatId,
          "🔗 *Primero vincula tu chat con tu cuenta web.*\n\n"
          + "Usa: _/vinculate CODIGO_"
        )
        return new Response(JSON.stringify({ ok: false, error: "Not linked" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const { data: existing } = await supabase
        .from("presupuestos")
        .select("id")
        .eq("user_id", link.user_id)
        .eq("categoria", categoria)
        .eq("mes", mesStart)
        .maybeSingle()

      if (existing) {
        await supabase
          .from("presupuestos")
          .update({ monto, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      } else {
        await supabase
          .from("presupuestos")
          .insert({ user_id: link.user_id, categoria, mes: mesStart, monto })
      }

      const formattedMonto = new Intl.NumberFormat("es-CL", {
        style: "currency", currency: "CLP", maximumFractionDigits: 0,
      }).format(monto)

      await sendTelegramMessage(chatId,
        `✅ *Presupuesto actualizado:* ${categoria} — ${formattedMonto}`
      )
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    let monto: number
    let concepto: string
    let categoria: string
    let tipo: string

    try {
      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nMensaje: ${text}`)
      const responseText = result.response.text()
      const parsed = JSON.parse(responseText)

      if (parsed.error) throw new Error(parsed.error)
      if (!parsed.monto || !parsed.concepto || !parsed.categoria || !parsed.tipo) throw new Error("Invalid response")
      monto = parsed.monto
      concepto = parsed.concepto
      categoria = parsed.categoria
      tipo = parsed.tipo
    } catch (err) {
      const fallback = parseGastoFallback(text)
      if (!fallback) {
        await sendTelegramMessage(
          chatId,
          `❌ *No pude entender el mensaje.*\n\nIntenta con algo como:\n_"almuerzo 5000"_\n_"sueldo 500000"_`,
        )
        return new Response(JSON.stringify({ ok: false, error: "No se pudo parsear" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }
      monto = fallback.monto
      concepto = fallback.concepto
      categoria = fallback.categoria
      tipo = fallback.tipo
    }

    if (!CATEGORIAS.includes(categoria as typeof CATEGORIAS[number])) {
      categoria = "Otros"
    }

    const { data: link } = await supabase
      .from("user_telegram_links")
      .select("user_id")
      .eq("telegram_chat_id", String(chatId))
      .maybeSingle()

    if (!link) {
      await sendTelegramMessage(chatId,
        "🔗 *Primero vincula tu chat con tu cuenta web.*\n\n"
        + "Desde el Dashboard de PerJaus genera un código en \"Conectar Telegram\"\n"
        + "y luego envía:\n"
        + "_/vinculate CODIGO_"
      )
      return new Response(JSON.stringify({ ok: false, error: "Not linked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const tabla = tipo === "ingreso" ? "ingresos" : "gastos"
    const { error: insertError } = await supabase.from(tabla).insert({
      monto,
      concepto,
      categoria,
      telegram_chat_id: String(chatId),
      user_id: link.user_id,
    })

    if (insertError) {
      await sendTelegramMessage(chatId, `❌ *Error al guardar.* Intenta de nuevo.`)
      return new Response(JSON.stringify({ ok: false, error: insertError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const formattedMonto = new Intl.NumberFormat("es-CL", {
      style: "currency", currency: "CLP", maximumFractionDigits: 0,
    }).format(monto)

    const emoji = tipo === "ingreso" ? "💰" : "✅"
    const label = tipo === "ingreso" ? "Ingreso registrado" : "Gasto registrado"

    await sendTelegramMessage(
      chatId,
      `${emoji} *${label}:* ${concepto} por ${formattedMonto} en la categoría *${categoria}*.`,
    )

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Webhook error:", err)
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

async function sendTelegramMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
  })
  if (!res.ok) {
    console.error("Telegram API error:", await res.text())
  }
}
