import { TelegramLogo, GoogleLogo, GithubLogo } from "@phosphor-icons/react"
import { useAuth } from "@/lib/auth"
import { formatCurrency } from "@/lib/utils"

interface FooterProps {
  variant: "landing" | "dashboard"
}

interface DashboardFooterProps {
  totalGastosMes: number
  totalIngresosMes: number
  balance: number
  userEmail?: string
}

export function Footer({ variant }: FooterProps) {
  if (variant === "landing") return <LandingFooter />
  return null
}

export function DashboardFooter({ totalGastosMes, totalIngresosMes, balance, userEmail }: DashboardFooterProps) {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="grid gap-6 md:grid-cols-4">
          <div className="space-y-1 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-yellow-400 text-[10px] font-bold text-zinc-950">
                P
              </div>
              <span className="text-sm font-semibold text-card-foreground">PerJaus</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Control financiero personal</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Gastos del mes</p>
            <p className="text-sm font-semibold text-card-foreground">{formatCurrency(totalGastosMes)}</p>
            <p className="text-[10px] text-muted-foreground">Total gastado</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Ingresos del mes</p>
            <p className="text-sm font-semibold text-emerald-400">{formatCurrency(totalIngresosMes)}</p>
            <p className="text-[10px] text-muted-foreground">Total recibido</p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Balance</p>
            <p className={`text-sm font-semibold ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {formatCurrency(Math.abs(balance))}
            </p>
            <p className="text-[10px] text-muted-foreground">{balance >= 0 ? "A favor" : "En contra"}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-3 md:flex-row">
          <p className="text-[10px] text-zinc-700">
            &copy; {new Date().getFullYear()} PerJaus
          </p>
          <p className="text-[10px] text-zinc-700">{userEmail ?? "v0.1.0"}</p>
        </div>
      </div>
    </footer>
  )
}

function LandingFooter() {
  const { signInWithGoogle } = useAuth()

  return (
    <footer className="relative z-10 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-sm font-bold text-zinc-950">
                P
              </div>
              <span className="text-lg font-semibold tracking-tight">PerJaus</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Control financiero personal simple y rapido. Registra tus gastos desde Telegram y visualiza tus habitos de consumo en tiempo real.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://t.me/PerJausBot"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 transition-colors hover:bg-sky-500/20"
                title="Telegram"
              >
                <TelegramLogo className="h-4 w-4" weight="fill" />
              </a>
              <a
                href="https://github.com/opmp24/Moni"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                title="GitHub"
              >
                <GithubLogo className="h-4 w-4" weight="fill" />
              </a>
              <a
                href="https://www.netlify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 transition-colors hover:bg-teal-500/20"
                title="Netlify"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M6.49 19.04h-2.7l-1.65-1.64v-2.7l4.35-4.35v2.7l-1.64 1.65h1.64v2.34zm9.02-14.08h2.7l1.65 1.64v2.7l-4.35 4.35v-2.7l1.64-1.65h-1.64v-2.34zm-7.98 7.2l-1.65-1.64v-2.7l4.35-4.35v2.7l-1.64 1.65h1.64v2.34H7.53zm9.96 6.88l1.65-1.64v-2.7l-4.35-4.35v2.7l1.64 1.65h-1.64v2.34h2.7z"/>
                </svg>
              </a>
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors hover:bg-emerald-500/20"
                title="Supabase"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M21.362 9.354H12V.018l9.362 9.336zM12 9.354H2.638L12 .018v9.336zm0 9.26V24l-5.84-7.591h4.39l1.45-3.795.787 2.056.597 1.562h4.426L12 18.614z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Producto</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-yellow-400">Caracteristicas</a></li>
              <li><a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-yellow-400">Como funciona</a></li>
              <li>
                <a
                  href="https://t.me/PerJausBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground transition-colors hover:text-yellow-400"
                >
                  Bot de Telegram
                </a>
              </li>
              <li><span className="text-sm text-muted-foreground">Preguntas frecuentes</span></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Comienza ahora</h4>
            <p className="text-sm text-muted-foreground">Registra tus gastos en segundos y toma el control de tus finanzas.</p>
            <button
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-yellow-300"
            >
              <GoogleLogo className="h-4 w-4" />
              Continuar con Google
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 md:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} PerJaus &mdash; Control financiero personal
          </p>
          <p className="text-xs text-muted-foreground">
            Hecho con <span className="text-yellow-400">♥</span> y codigo abierto
          </p>
        </div>
      </div>
    </footer>
  )
}
