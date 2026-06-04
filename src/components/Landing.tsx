import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { InstallPWA } from "@/components/InstallPWA"
import { Button } from "@/components/ui/button"
import {
  TelegramLogo,
  ChartPieSlice,
  DeviceMobile,
  ArrowRight,
  GoogleLogo,
  Wallet,
  TrendUp,
  Receipt,
  Robot,
  ShieldCheck,
  Lightning,
} from "@phosphor-icons/react"

const features = [
  {
    icon: TelegramLogo,
    title: "Registro vía Telegram",
    desc: "Agrega gastos al instante desde Telegram. Envía un mensaje como \"almuerzo 5000\" y el bot lo procesa automáticamente.",
  },
  {
    icon: ChartPieSlice,
    title: "Dashboard inteligente",
    desc: "Visualiza tus finanzas con gráficos por categorías, evolución mensual y presupuestos. Todo en tiempo real.",
  },
  {
    icon: DeviceMobile,
    title: "App instalable",
    desc: "PerJaus funciona como una app nativa en tu celular. Instálala con un clic y úsala sin conexión.",
  },
]

const steps = [
  { icon: GoogleLogo, label: "Inicia sesión", desc: "Con tu cuenta de Google, en segundos." },
  { icon: Robot, label: "Conecta Telegram", desc: "En la web genera un código y envíalo al bot @PerJausBot con /vinculate." },
  { icon: Lightning, label: "Registra gastos", desc: "Envía mensajes como \"taxi 3000\" al bot y nosotros lo procesamos." },
]

const metrics = [
  { icon: Wallet, value: "CLP $0", label: "Sin costos ocultos" },
  { icon: TrendUp, value: "Tiempo real", label: "Sincronización automática" },
  { icon: Receipt, value: "ILIMITADO", label: "Transacciones sin límite" },
]

export function Landing() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true })
  }, [user, navigate])

  if (user) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,214,0,0.12),transparent)] pointer-events-none" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-sm font-bold text-zinc-950">
            P
          </div>
          <span className="text-lg font-semibold tracking-tight">PerJaus</span>
        </div>
        <div className="flex items-center gap-3">
          <InstallPWA />
          <Button
            onClick={signInWithGoogle}
            className="gap-2 bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-medium"
          >
            <GoogleLogo className="h-4 w-4" />
            Ingresar
          </Button>
        </div>
      </header>

      <main>
        <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div className={`transition-all duration-700 ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-400">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                Control financiero personal
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Tus finanzas en{" "}
                <span className="text-yellow-400">un solo lugar</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-zinc-400 md:text-lg">
                Registra tus gastos desde Telegram, visualiza tus hábitos de consumo
                y mantén el control de tu dinero. Simple, rápido, sin esfuerzo.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  onClick={signInWithGoogle}
                  size="lg"
                  className="gap-2 bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-medium px-6"
                >
                  <GoogleLogo className="h-5 w-5" />
                  Comenzar gratis
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <InstallPWA />
              </div>
            </div>

            <div className={`relative transition-all duration-700 delay-200 ${mounted ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
              <DashboardPreview />
            </div>
          </div>
        </section>

        <section className="relative z-10 border-t border-zinc-800/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Por qué <span className="text-yellow-400">PerJaus</span>
              </h2>
              <p className="mt-3 text-zinc-400 max-w-lg mx-auto">
                Olvídate de hojas de cálculo. Tu dinero merece algo mejor.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/60"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-zinc-400">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 border-t border-zinc-800/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Cómo funciona
              </h2>
              <p className="mt-3 text-zinc-400">Tres pasos y ya estás listo.</p>
            </div>
            <div className="relative flex flex-col gap-0 md:flex-row md:gap-8">
              {steps.map((s, i) => (
                <div key={s.label} className="relative flex-1">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-yellow-400">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <div className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-zinc-950">
                      {i + 1}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{s.label}</h3>
                    <p className="mt-1 text-sm text-zinc-400 max-w-xs">{s.desc}</p>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[60%] w-[calc(80%)] border-t border-dashed border-zinc-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 border-t border-zinc-800/60 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid items-center gap-10 md:grid-cols-5">
              <div className="md:col-span-2">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Bot de <span className="text-yellow-400">Telegram</span>
                </h2>
                <p className="mt-3 text-zinc-400">
                  El bot <span className="font-mono text-yellow-400">@PerJausBot</span> procesa tu lenguaje natural y registra los gastos automáticamente.
                </p>
                <div className="mt-5 space-y-2 text-sm text-zinc-400">
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                    <span><strong className="text-zinc-200">Mensajes simples:</strong> <span className="text-zinc-500">"almuerzo 5000", "taxi 3000"</span></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                    <span><strong className="text-zinc-200">Múltiples items:</strong> <span className="text-zinc-500">"cine 8000 + palomitas 4000"</span></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                    <span><strong className="text-zinc-200">Cantidades:</strong> <span className="text-zinc-500">"2 entradas cada una 4000"</span></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                    <span><strong className="text-zinc-200">Vinculación:</strong> <span className="text-zinc-500">Genera un código en la web y envía <span className="font-mono text-yellow-400">/vinculate CODIGO</span> al bot</span></span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                  <div className="mb-3 flex items-center gap-2 border-b border-zinc-800 pb-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500">
                      <TelegramLogo className="h-3.5 w-3.5 text-white" weight="fill" />
                    </div>
                    <span className="text-sm font-medium">@PerJausBot</span>
                    <span className="ml-auto text-[10px] text-zinc-600">En línea</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-br-md bg-yellow-400/10 px-3 py-2 text-sm text-zinc-200">
                        almuerzo 5000
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md bg-zinc-800/80 px-3 py-2 text-sm text-zinc-300">
                        ✅ <strong>Gasto registrado:</strong> Almuerzo por $5.000 en <strong>Alimentación</strong>.
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="rounded-2xl rounded-br-md bg-yellow-400/10 px-3 py-2 text-sm text-zinc-200">
                        cine 8000 + palomitas 4000
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md bg-zinc-800/80 px-3 py-2 text-sm text-zinc-300">
                        ✅ <strong>Gasto registrado:</strong> Cine por $8.000 en <strong>Entretenimiento</strong>.
                      </div>
                      <div className="rounded-2xl rounded-bl-md bg-zinc-800/80 px-3 py-2 text-sm text-zinc-300 mt-1">
                        ✅ <strong>Gasto registrado:</strong> Palomitas por $4.000 en <strong>Entretenimiento</strong>.
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md bg-zinc-800/80 px-2.5 py-1 text-[10px] text-zinc-500">
                        /vinculate — Vincula tu chat con la web
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 border-t border-zinc-800/60 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-4 md:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label} className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400">
                    <m.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{m.value}</p>
                    <p className="text-xs text-zinc-500">{m.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative z-10 border-t border-zinc-800/60 py-24">
          <div className="mx-auto max-w-6xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              ¿Listo para tomar el control?
            </h2>
            <p className="mt-3 text-zinc-400 max-w-md mx-auto">
            Únete a PerJaus y empieza a gestionar tus finanzas de forma inteligente.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={signInWithGoogle}
                size="lg"
                className="gap-2 bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-medium px-8 py-6 text-base"
              >
                <GoogleLogo className="h-5 w-5" />
                Continuar con Google
              </Button>
              <InstallPWA />
            </div>
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Tus datos están seguros con Supabase
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-zinc-800/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-yellow-400 text-xs font-bold text-zinc-950">
              P
            </div>
            PerJaus &mdash; Control financiero personal
          </div>
          <p className="text-xs text-zinc-600">
            Hecho con &mdash; y código abierto
          </p>
        </div>
      </footer>
    </div>
  )
}

function DashboardPreview() {
  const bars = [
    { label: "Ene", value: 40 },
    { label: "Feb", value: 60 },
    { label: "Mar", value: 35 },
    { label: "Abr", value: 80 },
    { label: "May", value: 55 },
    { label: "Jun", value: 70 },
  ]
  const categories = [
    { label: "Alimentación", value: 45, color: "#FFD600" },
    { label: "Transporte", value: 20, color: "#FF6B35" },
    { label: "Vivienda", value: 15, color: "#004E98" },
    { label: "Otros", value: 20, color: "#6B7280" },
  ]
  const maxBar = Math.max(...bars.map(b => b.value))

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 shadow-2xl shadow-yellow-400/5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-500">Este mes</p>
          <p className="text-xl font-bold">$ 340.000</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400">
          <Wallet className="h-4 w-4" />
        </div>
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
          <p className="text-[10px] text-zinc-500">Top categoría</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <p className="text-sm font-semibold">Alimentación</p>
          </div>
          <p className="text-xs text-zinc-400">$ 153.000</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
          <p className="text-[10px] text-zinc-500">Transacciones</p>
          <p className="mt-1 text-sm font-semibold">24 este mes</p>
          <p className="text-xs text-yellow-400">+3 hoy</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-zinc-400">Evolución mensual</p>
        <div className="flex items-end gap-1.5">
          {bars.map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-sm bg-yellow-400/80 transition-all duration-500"
                style={{ height: `${(b.value / maxBar) * 48}px` }}
              />
              <span className="text-[10px] text-zinc-600">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-zinc-400">Por categoría</p>
        <div className="flex h-2 overflow-hidden rounded-full">
          {categories.map((c) => (
            <div key={c.label} style={{ width: `${c.value}%`, backgroundColor: c.color }} />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          {categories.map((c) => (
            <div key={c.label} className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-[10px] text-zinc-500">{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
