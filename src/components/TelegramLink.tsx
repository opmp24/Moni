import { useState, useEffect, useCallback } from "react"
import { TelegramLogo, CheckCircle, Copy } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

export function TelegramLink() {
  const { user } = useAuth()
  const [linked, setLinked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!supabase || !user) {
      setLoading(false)
      return
    }
    supabase
      .from("user_telegram_links")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => setLinked(!!data))
      .then(() => setLoading(false))
  }, [user])

  const handleGenerate = useCallback(async () => {
    if (!supabase || !user) return
    setGenerating(true)
    const newCode = generateCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error } = await supabase.from("vinculate_codes").insert({
      user_id: user.id,
      code: newCode,
      expires_at: expiresAt,
    })

    if (!error) {
      setCode(newCode)
      setTimeout(async () => {
        if (supabase) await supabase.from("vinculate_codes").delete().eq("code", newCode)
        setCode(null)
      }, 10 * 60 * 1000)
    }
    setGenerating(false)
  }, [user])

  const handleCopy = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return null

  if (linked) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 px-4 py-2.5 text-sm">
        <CheckCircle className="h-4 w-4 text-emerald-500 dark:text-emerald-400" weight="fill" />
        <span className="text-emerald-600 dark:text-emerald-300">Telegram conectado</span>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
            <TelegramLogo className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Conectar Telegram</p>
            <p className="text-xs text-muted-foreground">Registra gastos desde tu chat</p>
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          size="sm"
          variant="outline"
          className="border-border text-card-foreground hover:bg-accent"
        >
          {generating ? (
            <span className="mr-1 h-3 w-3 animate-spin rounded-full border border-zinc-400 border-t-transparent" />
          ) : null}
          Conectar
        </Button>
      </div>
      {code && (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Envía este código al bot de Telegram:</p>
            <p className="mt-0.5 font-mono text-lg font-bold tracking-wider text-yellow-400">
              {code}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Válido por 10 minutos</p>
          </div>
          <Button size="icon" variant="ghost" onClick={handleCopy} className="h-8 w-8 text-muted-foreground">
            {copied ? <CheckCircle className="h-4 w-4" weight="fill" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  )
}
