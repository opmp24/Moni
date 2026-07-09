import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"

interface TelegramUpdate {
  message?: {
    chat: { id: number }
    text?: string
  }
}

interface ParseResult {
  monto: number
  concepto: string
  categoria: string
  tipo: "gasto" | "ingreso" | "compromiso"
  fecha?: string
  recurrente?: boolean
}

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!
const NVIDIA_API_KEY = Deno.env.get("NVIDIA_API_KEY")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const CATEGORIAS_PREDEFINIDAS = ["Alimentación", "Transporte", "Vivienda", "Salud", "Entretenimiento", "Ingresos", "Otros"]

const NVIDIA_MODEL = "meta/llama-3.1-8b-instruct"
const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions"

function construirPrompt(categorias: string[]): string {
  const cats = JSON.stringify(categorias)
  return `Eres un asistente financiero. El usuario tiene estas categorías disponibles: ${cats}

Del mensaje del usuario extrae esta información en JSON:
- monto: número entero (NO USES separadores de miles, puntos ni comas. Calcula multiplicaciones si es necesario)
- concepto: string (descripción corta capitalizada, sin el monto)
- categoria: string (estrictamente una de las categorías listadas)
- tipo: "gasto" | "ingreso" | "compromiso"
- fecha: string opcional en formato YYYY-MM-DD (si el mensaje menciona "ayer", "anteayer", "el lunes", "2 de julio", etc.)
- recurrente: boolean opcional (true solo si menciona "cada mes", "todos los meses", "mensual")

REGLAS IMPORTANTES:
1. MULTIPLICACIÓN: Si dice "4 entradas a 10000", "3 cosas de 5000", "2 x 3000": calcula monto = cantidad × precio_unitario
2. INGRESOS: Si habla de sueldo, salario, pago recibido, transferencia recibida, ingreso, remuneración, honorario, freelance → categoria "Ingresos", tipo "ingreso"
3. COMPROMISOS: Si menciona "el día X de cada mes", "el X de cada mes", "pago recurrente" → tipo "compromiso", recurrente true. Guarda la fecha del día (ej: "día 1" → fecha = YYYY-MM-01 del mes actual)
4. COMPROMISO ÚNICO: Si menciona "el día X" sin "cada mes" → tipo "compromiso", recurrente false, fecha = la fecha mencionada
5. Para gastos normales: tipo "gasto", elige la categoría más adecuada
6. Si hay múltiples items separados por +, y, & → responde con un ARRAY JSON

EJEMPLOS:
- "almuerzo 5000" → {"monto":5000,"concepto":"Almuerzo","categoria":"Alimentación","tipo":"gasto"}
- "sueldo 500000" → {"monto":500000,"concepto":"Sueldo","categoria":"Ingresos","tipo":"ingreso"}
- "4 entradas a 10000" → {"monto":40000,"concepto":"Entradas","categoria":"Entretenimiento","tipo":"gasto"}
- "taxi 3000 ayer" → {"monto":3000,"concepto":"Taxi","categoria":"Transporte","tipo":"gasto","fecha":"2026-07-07"}
- "arriendo el 1 de cada mes por 300000" → {"monto":300000,"concepto":"Arriendo","categoria":"Vivienda","tipo":"compromiso","recurrente":true,"fecha":"2026-07-01"}
- "pago autopista el dia 23 por 30000" → {"monto":30000,"concepto":"Autopista","categoria":"Transporte","tipo":"compromiso","fecha":"2026-07-23"}
- "pago prestamo el 5 de cada mes por 50000" → {"monto":50000,"concepto":"Préstamo","categoria":"Otros","tipo":"compromiso","recurrente":true,"fecha":"2026-07-05"}
- "3 cervezas a 2500" → {"monto":7500,"concepto":"Cervezas","categoria":"Entretenimiento","tipo":"gasto"}

Responde ÚNICAMENTE con un JSON. Si no puedes identificar, responde {"error": "No pude entender el mensaje"}.`
}

async function llamarNVIDIA(prompt: string): Promise<string> {
  const response = await fetch(NVIDIA_ENDPOINT, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NVIDIA_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: NVIDIA_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 500,
      response_format: { type: "json_object" },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`NVIDIA API error: ${response.status} ${err}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function parseDateFromText(texto: string): string | undefined {
  const hoy = new Date()
  const lower = texto.toLowerCase()

  if (/anteayer/i.test(lower)) {
    const d = new Date(hoy)
    d.setDate(d.getDate() - 2)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  if (/ayer/i.test(lower)) {
    const d = new Date(hoy)
    d.setDate(d.getDate() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  const diaMatch = lower.match(/el\s*(d[ií]a\s*)?(\d{1,2})\s*(de\s*(\w+))?/)
  if (diaMatch) {
    const dia = parseInt(diaMatch[2], 10)
    const meses: Record<string, number> = {
      enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
      julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
    }
    const mesNombre = diaMatch[4]?.toLowerCase()
    const mesNum = mesNombre !== undefined ? meses[mesNombre] : undefined
    const d = new Date(hoy.getFullYear(), mesNum ?? hoy.getMonth(), dia)
    if (d > hoy && mesNombre) d.setFullYear(d.getFullYear() - 1)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  return undefined
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
    const token = tokens[i].replace(/\./g, "")
    if (/^\d+$/.test(token) && parseInt(token) > 0) {
      found.push({ index: i, valor: parseInt(token, 10) })
    } else if (numerosPalabras[token]) {
      found.push({ index: i, valor: numerosPalabras[token] })
    }
  }

  // Patrón "cada una" (existente)
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

  // Patrón "X [items] a Y" → X * Y
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== "a" && tokens[i] !== "x") continue
    let beforeIdx = -1
    for (let j = found.length - 1; j >= 0; j--) {
      if (!usado.has(j) && found[j].index < i) { beforeIdx = j; break }
    }
    let afterIdx = -1
    for (let j = 0; j < found.length; j++) {
      if (!usado.has(j) && found[j].index > i) { afterIdx = j; break }
    }
    if (beforeIdx >= 0 && afterIdx >= 0) {
      usado.add(beforeIdx)
      usado.add(afterIdx)
      total += found[beforeIdx].valor * found[afterIdx].valor
    }
  }

  // Patrón "X [items] de Y" → X * Y (solo si "de" conecta dos números libres)
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== "de") continue
    let beforeIdx = -1
    for (let j = found.length - 1; j >= 0; j--) {
      if (!usado.has(j) && found[j].index < i) { beforeIdx = j; break }
    }
    let afterIdx = -1
    for (let j = 0; j < found.length; j++) {
      if (!usado.has(j) && found[j].index > i) { afterIdx = j; break }
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

function parseGastoFallback(text: string): ParseResult | null {
  const monto = parsearNumeros(text)
  if (monto <= 0) return null

  const texto = text.toLowerCase()

  const esIngreso = /sueldo|salario|remuneraci[oó]n|ingreso|pago\s*(recibido|mensual|quincenal|semanal)?|transferencia\s*(recibida)?|honorario/i.test(texto)
  if (esIngreso) {
    let concepto = text.replace(/\$?\s*[\d.]+\s*/gi, "").trim()
    concepto = concepto.charAt(0).toUpperCase() + concepto.slice(1)
    if (!concepto) concepto = "Ingreso"
    return { monto, concepto, categoria: "Ingresos", tipo: "ingreso", fecha: parseDateFromText(text) }
  }

  // Compromiso detection
  const esCompromiso = /arriendo\s*(el|del)?\s*\d+|el\s*(d[ií]a\s*)?\d+\s*(de\s*cada|de\s*este|cada\s*mes)|pago\s*(mensual|recurrente)?/i.test(texto)
  if (esCompromiso) {
    const diaMatch = texto.match(/(\d{1,2})\s*(de\s*cada\s*mes|de\s*este\s*mes|cada\s*mes)/)
    const recurrente = diaMatch !== null || /cada\s*mes|todos\s*los\s*meses|mensual/i.test(texto)

    const fecha = parseDateFromText(text) ?? (() => {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    })()

    let concepto = text.replace(/\$?\s*[\d.]+\s*/gi, "").trim()
    concepto = concepto.replace(/\b(el|del|dia|de|cada|mes|este|por|un|una|pago)\b/gi, "").trim()
    concepto = concepto.charAt(0).toUpperCase() + concepto.slice(1)
    if (!concepto) concepto = "Compromiso"

    const categoria = /arriendo|renta|hipoteca/i.test(texto) ? "Vivienda"
      : /pr[eé]stamo|cuota|credito|cra[eé]dito/i.test(texto) ? "Otros"
      : /autopista|peaje/i.test(texto) ? "Transporte"
      : /luz|agua|gas|electricidad|internet|tel[eé]fono/i.test(texto) ? "Vivienda"
      : "Otros"

    return { monto, concepto, categoria, tipo: "compromiso", fecha, recurrente }
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
    if (regex.test(texto)) { categoria = cat; break }
  }

  let concepto = text.replace(/\$?\s*[\d.]+\s*(?:x\s*)?\d*\s*(?:a\s*)?\d*\s*(?:cada\s*una?)?/gi, "").trim()
  const stopWords = ["compre", "compre", "pague", "pague", "gaste", "gaste", "comprar", "pagar", "gastar", "por", "de", "en", "un", "una", "unos", "unas", "el", "la", "los", "las", "con", "del", "para", "se", "me", "ayer", "hoy", "dos", "tres", "a", "x"]
  concepto = concepto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  concepto = concepto.replace(/\b(?:cada\s*una?)\b/gi, "").trim()
  concepto = concepto.split(/\s+/).filter(w => !stopWords.includes(w)).join(" ")
  concepto = concepto.charAt(0).toUpperCase() + concepto.slice(1)
  if (!concepto) concepto = "Gasto"

  return { monto, concepto, categoria, tipo: "gasto", fecha: parseDateFromText(text) }
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
        "👋 ¡Bienvenido a Wally!\n\n"
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
        "🤖 *Comandos Wally:*\n\n"
        + "Envíame cualquier gasto y lo registro automáticamente.\n"
        + "Ejemplos:\n"
        + "_almuerzo 5000_\n"
        + "_sueldo 500000_\n"
        + "_taxi 3000_\n"
        + "_4 entradas a 10000_\n"
        + "_arriendo el 1 de cada mes por 300000_\n"
        + "_pago autopista el dia 23_\n\n"
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
          "❌ Debes incluir el código. Ejemplo:\n" + "_/vinculate ABC123_"
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

      const { data: cats } = await supabase
        .from("categorias")
        .select("nombre")
        .eq("user_id", link.user_id)
      const categoriasDisponibles = [...new Set([...CATEGORIAS_PREDEFINIDAS, ...(cats?.map(c => c.nombre) ?? [])])]

      if (!categoriasDisponibles.includes(categoria)) {
        await sendTelegramMessage(chatId,
          `❌ Categoría inválida. Categorías: ${categoriasDisponibles.filter(c => c !== "Ingresos").join(", ")}`
        )
        return new Response(JSON.stringify({ ok: false, error: "Invalid category" }), {
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
        await supabase.from("presupuestos").update({ monto, updated_at: new Date().toISOString() }).eq("id", existing.id)
      } else {
        await supabase.from("presupuestos").insert({ user_id: link.user_id, categoria, mes: mesStart, monto })
      }

      const formattedMonto = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(monto)
      await sendTelegramMessage(chatId, `✅ *Presupuesto actualizado:* ${categoria} — ${formattedMonto}`)
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { data: link } = await supabase
      .from("user_telegram_links")
      .select("user_id")
      .eq("telegram_chat_id", String(chatId))
      .maybeSingle()

    if (!link) {
      await sendTelegramMessage(chatId,
        "🔗 *Primero vincula tu chat con tu cuenta web.*\n\n"
        + "Desde el Dashboard de Wally genera un código en \"Conectar Telegram\"\n"
        + "y luego envía:\n" + "_/vinculate CODIGO_"
      )
      return new Response(JSON.stringify({ ok: false, error: "Not linked" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const { data: cats } = await supabase
      .from("categorias")
      .select("nombre")
      .eq("user_id", link.user_id)
    const categoriasUsuario = [...new Set([...CATEGORIAS_PREDEFINIDAS, ...(cats?.map(c => c.nombre) ?? [])])]

    let resultado: ParseResult
    try {
      const prompt = construirPrompt(categoriasUsuario)
      const responseText = await llamarNVIDIA(`${prompt}\n\nMensaje: ${text}`)
      const parsed = JSON.parse(responseText)

      if (parsed.error) throw new Error(parsed.error)
      if (!parsed.monto || !parsed.concepto || !parsed.categoria || !parsed.tipo) throw new Error("Invalid response")

      const hoy = new Date()
      const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`

      resultado = {
        monto: parsed.monto,
        concepto: parsed.concepto,
        categoria: parsed.categoria,
        tipo: parsed.tipo,
        fecha: parsed.fecha ?? hoyStr,
        recurrente: parsed.recurrente ?? false,
      }
    } catch (err) {
      const fallback = parseGastoFallback(text)
      if (!fallback) {
        await sendTelegramMessage(chatId,
          `❌ *No pude entender el mensaje.*\n\nIntenta con algo como:\n_"almuerzo 5000"_\n_"4 entradas a 10000"_\n_"sueldo 500000"_`,
        )
        return new Response(JSON.stringify({ ok: false, error: "No se pudo parsear" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }
      resultado = fallback
    }

    if (!categoriasUsuario.includes(resultado.categoria)) {
      resultado.categoria = "Otros"
    }

    if (!resultado.fecha) {
      const hoy = new Date()
      resultado.fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`
    }

    if (resultado.tipo === "compromiso") {
      const { error: insertError } = await supabase.from("compromisos").insert({
        user_id: link.user_id,
        concepto: resultado.concepto,
        monto: resultado.monto,
        categoria: resultado.categoria,
        fecha_vencimiento: resultado.fecha,
        recurrente: resultado.recurrente ?? false,
      })

      if (insertError) {
        await sendTelegramMessage(chatId, "❌ *Error al guardar el compromiso.* Intenta de nuevo.")
        return new Response(JSON.stringify({ ok: false, error: insertError }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }

      const formattedMonto = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(resultado.monto)
      const freq = resultado.recurrente ? " (recurrente)" : ""
      await sendTelegramMessage(chatId,
        `📅 *Compromiso registrado${freq}:* ${resultado.concepto} por ${formattedMonto} el ${resultado.fecha} en *${resultado.categoria}*.`
      )
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const tabla = resultado.tipo === "ingreso" ? "ingresos" : "gastos"
    const { error: insertError } = await supabase.from(tabla).insert({
      monto: resultado.monto,
      concepto: resultado.concepto,
      categoria: resultado.categoria,
      fecha: new Date(resultado.fecha + "T12:00:00").toISOString(),
      telegram_chat_id: String(chatId),
      user_id: link.user_id,
    })

    if (insertError) {
      await sendTelegramMessage(chatId, "❌ *Error al guardar.* Intenta de nuevo.")
      return new Response(JSON.stringify({ ok: false, error: insertError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const formattedMonto = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(resultado.monto)
    const emoji = resultado.tipo === "ingreso" ? "💰" : "✅"
    const label = resultado.tipo === "ingreso" ? "Ingreso registrado" : "Gasto registrado"
    const fechaTexto = resultado.fecha ? ` (${resultado.fecha})` : ""
    await sendTelegramMessage(chatId,
      `${emoji} *${label}:* ${resultado.concepto} por ${formattedMonto} en *${resultado.categoria}*${fechaTexto}.`
    )

    if (resultado.tipo === "gasto") {
      const ahora = new Date()
      const mesStart = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`

      const { data: presupuesto } = await supabase
        .from("presupuestos")
        .select("monto")
        .eq("user_id", link.user_id)
        .eq("categoria", resultado.categoria)
        .eq("mes", mesStart)
        .maybeSingle()

      if (presupuesto) {
        const { data } = await supabase
          .from("gastos")
          .select("monto")
          .eq("user_id", link.user_id)
          .eq("categoria", resultado.categoria)
          .gte("fecha", mesStart)

        const totalGastado = data?.reduce((s, g) => s + Number(g.monto), 0) ?? 0
        const pct = (totalGastado / Number(presupuesto.monto)) * 100

        if (pct >= 100) {
          await sendTelegramMessage(chatId,
            `⚠️ *¡Presupuesto agotado!* ${resultado.categoria} — ${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(totalGastado)} de ${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(presupuesto.monto))}`
          )
        } else if (pct >= 80) {
          await sendTelegramMessage(chatId,
            `⚠️ *Alerta de presupuesto:* ${resultado.categoria} al ${Math.round(pct)}% — ${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(totalGastado)} de ${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(Number(presupuesto.monto))}`
          )
        }
      }
    }

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
