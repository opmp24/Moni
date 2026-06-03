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

const CATEGORIAS = ["Alimentación", "Transporte", "Vivienda", "Salud", "Entretenimiento", "Otros"] as const

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: "gemini-3.1-flash-lite",
  generationConfig: { responseMimeType: "application/json" },
})

const SYSTEM_PROMPT = `Eres un asistente financiero. Extrae la siguiente información del mensaje del usuario:
- monto: número entero (el valor numérico del gasto)
- concepto: string (descripción corta, capitalizada)
- categoria: string (estrictamente uno de: 'Alimentación', 'Transporte', 'Vivienda', 'Salud', 'Entretenimiento', 'Otros')

Responde ÚNICAMENTE con un JSON con esos tres campos. Si no puedes identificar el gasto, responde {"error": "No pude identificar el gasto"}.`

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function parseGastoFallback(text: string): { monto: number; concepto: string; categoria: string } | null {
  const montoMatch = text.match(/\$?\s*(\d+)/)
  if (!montoMatch) return null
  const monto = parseInt(montoMatch[1].replace(/\./g, ""), 10)
  if (isNaN(monto) || monto <= 0) return null

  const texto = text.toLowerCase()
  const categoriaMap: [RegExp, string][] = [
    [/com[ií]|supermercado|mercado|panader[ií]a|almuerzo|desayuno|cena|carnicer[ií]a|fruta|verdura|pan|leche|huevo|comida/i, "Alimentación"],
    [/bus|micro|taxi|uber|colectivo|metro|gasolina|bencina|estacionamiento|peaje|transporte|combustible/i, "Transporte"],
    [/arriendo|renta|hipoteca|agua|luz|gas|electricidad|internet|tel[ée]fono|vivienda|departamento|casa/i, "Vivienda"],
    [/doctor|m[ée]dico|farmacia|medicina|hospital|cl[ií]nica|salud|dental|examen|remedio|pastilla/i, "Salud"],
    [/cine|netflix|spotify|juego|m[úu]sica|concierto|teatro|libro|club|helado|cerveza|bar|rest[oa]urante|entretenci[oó]n|ocio|pizza|hamburguesa/i, "Entretenimiento"],
  ]

  let categoria = "Otros"
  for (const [regex, cat] of categoriaMap) {
    if (regex.test(texto)) {
      categoria = cat
      break
    }
  }

  const match = text.match(/(?:por|de|en)\s*\$?\s*[\d.]+$/)
  let concepto = match ? text.slice(0, match.index).trim() : text
  const stopWords = ["compre", "pague", "gaste", "comprar", "pagar", "gastar", "por", "de", "en", "un", "una", "el", "la", "los", "las", "con", "del", "para", "se", "me"]
  concepto = concepto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").split(/\s+/).filter(w => !stopWords.includes(w.toLowerCase())).join(" ")
  concepto = concepto.charAt(0).toUpperCase() + concepto.slice(1).toLowerCase()
  if (!concepto) concepto = "Gasto"

  return { monto, concepto, categoria }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  try {
    const update: TelegramUpdate = await req.json()
    const chatId = update.message?.chat?.id
    const text = update.message?.text

    if (!chatId || !text) {
      return new Response(JSON.stringify({ ok: false, error: "No message" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (text.startsWith("/start")) {
      await sendTelegramMessage(chatId, "👋 ¡Bienvenido a PerJaus! Envíame un gasto en lenguaje natural, por ejemplo: *compré helados por $3000*")
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    let monto: number
    let concepto: string
    let categoria: string

    try {
      const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nMensaje: ${text}`)
      const responseText = result.response.text()
      const parsed = JSON.parse(responseText)

      if (parsed.error) throw new Error(parsed.error)
      monto = parsed.monto
      concepto = parsed.concepto
      categoria = parsed.categoria
    } catch (err) {
      const fallback = parseGastoFallback(text)
      if (!fallback) {
        await sendTelegramMessage(
          chatId,
          `❌ *No pude entender el gasto.*\n\nIntenta con algo como:\n_"compré helados por $3000 en el supermercado"_`,
        )
        return new Response(JSON.stringify({ ok: false, error: "No se pudo parsear" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        })
      }
      monto = fallback.monto
      concepto = fallback.concepto
      categoria = fallback.categoria
    }

    if (!CATEGORIAS.includes(categoria as typeof CATEGORIAS[number])) {
      categoria = "Otros"
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { error: insertError } = await supabase.from("gastos").insert({
      monto,
      concepto,
      categoria,
      telegram_chat_id: String(chatId),
    })

    if (insertError) {
      await sendTelegramMessage(chatId, `❌ *Error al guardar el gasto.* Intenta de nuevo.`)
      return new Response(JSON.stringify({ ok: false, error: insertError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const formattedMonto = new Intl.NumberFormat("es-CL", {
      style: "currency", currency: "CLP", maximumFractionDigits: 0,
    }).format(monto)

    await sendTelegramMessage(
      chatId,
      `✅ *Gasto registrado:* ${concepto} por ${formattedMonto} en la categoría *${categoria}*.`,
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
