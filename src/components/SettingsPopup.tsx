import { useState } from "react"
import { Coins, Tag, SignOut, ArrowDownRight, ArrowUpRight, Sun, Moon, Desktop, TelegramLogo, CheckCircle, Copy } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTheme } from "@/lib/theme"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

interface SettingsPopupProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onPresupuestos: () => void
  onCategorias: () => void
  onGasto: () => void
  onIngreso: () => void
  onCerrarSesion: () => void
}

const TEMAS = [
  { value: "light" as const, icon: Sun, label: "Claro" },
  { value: "dark" as const, icon: Moon, label: "Oscuro" },
  { value: "system" as const, icon: Desktop, label: "Sistema" },
]

export function SettingsPopup({
  open: controlledOpen,
  onOpenChange,
  onPresupuestos,
  onCategorias,
  onGasto,
  onIngreso,
  onCerrarSesion,
}: SettingsPopupProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [showTelegram, setShowTelegram] = useState(false)
  const [telegramLinked, setTelegramLinked] = useState(false)
  const [telegramLoading, setTelegramLoading] = useState(true)
  const [telegramCode, setTelegramCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()

  const closeAnd = (fn: () => void) => () => {
    setOpen(false)
    setTimeout(fn, 150)
  }

  const openTelegram = () => {
    setShowTelegram(true)
    checkTelegramStatus()
  }

  const backToMenu = () => {
    setShowTelegram(false)
    setTelegramCode(null)
  }

  const checkTelegramStatus = async () => {
    if (!supabase || !user) { setTelegramLoading(false); return }
    setTelegramLoading(true)
    const { data } = await supabase
      .from("user_telegram_links")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()
    setTelegramLinked(!!data)
    setTelegramLoading(false)
  }

  const generateCode = async () => {
    if (!supabase || !user) return
    setGenerating(true)
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let code = ""
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const { error } = await supabase.from("vinculate_codes").insert({
      user_id: user.id,
      code,
      expires_at: expiresAt,
    })
    if (!error) {
      setTelegramCode(code)
      setTimeout(async () => {
        if (supabase) await supabase.from("vinculate_codes").delete().eq("code", code)
        setTelegramCode(null)
      }, 10 * 60 * 1000)
    }
    setGenerating(false)
  }

  const handleCopy = () => {
    if (!telegramCode) return
    navigator.clipboard.writeText(telegramCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setShowTelegram(false); setTelegramCode(null) } }}>
      <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {showTelegram ? "Conectar Telegram" : "Configuración"}
          </DialogTitle>
        </DialogHeader>

        {showTelegram ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Vincula tu cuenta de Wally con el bot de Telegram para registrar gastos desde tu chat.
            </p>
            {telegramLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
              </div>
            ) : telegramLinked ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-950/30 px-4 py-3 text-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-400" weight="fill" />
                  <span className="text-emerald-300 font-medium">Telegram conectado</span>
                </div>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (supabase && user) {
                      await supabase.from("user_telegram_links").delete().eq("user_id", user.id)
                    }
                    setTelegramLinked(false)
                  }}
                  className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Desvincular Telegram
                </Button>
                <Button onClick={backToMenu} variant="ghost" className="w-full text-muted-foreground">
                  Volver
                </Button>
              </div>
            ) : telegramCode ? (
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-2">Envía este código al bot de Telegram:</p>
                <p className="font-mono text-2xl font-bold tracking-widest text-yellow-400 text-center py-3">
                  {telegramCode}
                </p>
                <p className="text-xs text-muted-foreground mb-3 text-center">Válido por 10 minutos</p>
                <div className="flex gap-2">
                  <Button onClick={handleCopy} variant="outline" className="flex-1 border-border">
                    {copied ? <CheckCircle className="mr-2 h-4 w-4" weight="fill" /> : <Copy className="mr-2 h-4 w-4" />}
                    {copied ? "Copiado" : "Copiar código"}
                  </Button>
                  <Button onClick={backToMenu} variant="ghost" className="text-muted-foreground">
                    Volver
                  </Button>
                </div>
                <div className="mt-4 rounded-lg border border-border bg-background p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Pasos siguientes:</p>
                  <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal list-inside">
                    <li>Abre Telegram en tu celular</li>
                    <li>Busca el bot <span className="font-mono text-yellow-400">@WallyBot</span></li>
                    <li>Inicia el chat y envía: <span className="font-mono text-yellow-400">/vinculate {telegramCode}</span></li>
                    <li>¡Recibirás una confirmación!</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-muted p-4 text-center">
                <TelegramLogo className="mx-auto h-10 w-10 text-sky-400 mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Presiona "Generar código" y luego envíalo al bot <span className="font-mono text-yellow-400">@WallyBot</span> en Telegram.
                </p>
                <Button onClick={generateCode} disabled={generating} className="bg-sky-500 hover:bg-sky-600 text-white gap-2">
                  {generating ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <TelegramLogo className="h-4 w-4" weight="fill" />
                  )}
                  Generar código
                </Button>
                <Button onClick={backToMenu} variant="ghost" className="ml-2 text-muted-foreground">
                  Volver
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-semibold text-muted-foreground">
                  {(user?.user_metadata?.full_name ?? user?.email ?? "U").charAt(0).toUpperCase()}
                </div>
                {user?.user_metadata?.avatar_url && (
                  <img
                    src={user.user_metadata.avatar_url}
                    alt="Avatar"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.user_metadata?.full_name ?? "Usuario"}
                </p>
                <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Tema</p>
              <div className="flex gap-2">
                {TEMAS.map((t) => {
                  const active = theme === t.value
                  const Icon = t.icon
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
                        active
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-border hover:bg-accent"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} weight={active ? "fill" : "bold"} />
                      <span className="text-xs font-medium">{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SettingsButton
                icon={Coins}
                label="Presupuesto"
                onClick={closeAnd(onPresupuestos)}
              />
              <SettingsButton
                icon={Tag}
                label="Categorías"
                onClick={closeAnd(onCategorias)}
              />
              <SettingsButton
                icon={TelegramLogo}
                label="Telegram"
                iconColor="text-sky-400"
                onClick={openTelegram}
              />
              <SettingsButton
                icon={ArrowDownRight}
                label="Gasto"
                iconColor="text-destructive"
                onClick={closeAnd(onGasto)}
              />
              <SettingsButton
                icon={ArrowUpRight}
                label="Ingreso"
                iconColor="text-emerald-400"
                onClick={closeAnd(onIngreso)}
              />
            </div>
            <Button
              variant="outline"
              onClick={closeAnd(onCerrarSesion)}
              className="mt-2 border-border text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <SignOut className="mr-2 h-4 w-4" weight="bold" />
              Cerrar sesión
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function SettingsButton({
  icon: Icon,
  label,
  iconColor,
  onClick,
}: {
  icon: React.ComponentType<any>
  label: string
  iconColor?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent hover:border-border"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted ${iconColor ?? "text-muted-foreground"}`}>
        <Icon className="h-5 w-5" weight="bold" />
      </div>
      <span className="text-sm font-medium text-card-foreground">{label}</span>
    </button>
  )
}
