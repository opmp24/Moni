import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.21.0"

interface TelegramUpdate {
  message?: {
    chat: { id: number }
    text?: string
  }
}

interface GeminiResponse {
  monto: number
  concepto: string
  categoria: string
}

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
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

    // Handle /start command
    if (text.startsWith("/start")) {
      await sendTelegramMessage(chatId, "👋 ¡Bienvenido a PerJaus! Envíame un gasto en lenguaje natural, por ejemplo: *compré helados por $3000*")
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Call Gemini
    const result = await model.generateContent(`${SYSTEM_PROMPT}\n\nMensaje: ${text}`)
    const responseText = result.response.text()
    const parsed: GeminiResponse & { error?: string } = JSON.parse(responseText)

    if (parsed.error) {
      await sendTelegramMessage(
        chatId,
        `❌ *No pude entender el gasto.*\n\nIntenta con algo como:\n_\"compré helados por $3000 en el supermercado\"_`,
      )
      return new Response(JSON.stringify({ ok: false, error: parsed.error }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Insert into Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const { error: insertError } = await supabase.from("gastos").insert({
      monto: parsed.monto,
      concepto: parsed.concepto,
      categoria: parsed.categoria,
      telegram_chat_id: String(chatId),
    })

    if (insertError) {
      console.error("Insert error:", insertError)
      await sendTelegramMessage(chatId, `❌ *Error al guardar el gasto.* Intenta de nuevo.`)
      return new Response(JSON.stringify({ ok: false, error: insertError }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Confirm to user
    const formattedMonto = new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(parsed.monto)

    await sendTelegramMessage(
      chatId,
      `✅ *Gasto registrado:* ${parsed.concepto} por ${formattedMonto} en la categoría *${parsed.categoria}*.`,
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
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "Markdown",
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    console.error("Telegram API error:", body)
  }
}
