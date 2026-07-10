import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import Lenis from "lenis"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/auth"
import { InstallPWA } from "@/components/InstallPWA"
import { Footer } from "@/components/Footer"
import { Button } from "@/components/ui/button"
import { ThreeDollarSign } from "@/components/ThreeDollarSign"
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
    desc: "Agrega gastos al instante desde Telegram. El bot entiende lenguaje natural: \"remedios por 5000 y vitaminas 3000\".",
  },
  {
    icon: ChartPieSlice,
    title: "Dashboard inteligente",
    desc: "Visualiza tus finanzas con gráficos por categorías, evolución mensual y presupuestos. Todo en tiempo real.",
  },
  {
    icon: DeviceMobile,
    title: "App instalable",
    desc: "Wally funciona como una app nativa en tu celular. Instálala con un clic y úsala sin conexión.",
  },
]

const steps = [
  { icon: GoogleLogo, label: "Inicia sesión", desc: "Con tu cuenta de Google, en segundos." },
  { icon: Robot, label: "Conecta Telegram", desc: "En la web genera un código y envíalo al bot @WallyBot con /vinculate." },
  { icon: Lightning, label: "Registra gastos", desc: "Envía mensajes como \"taxi 3000\" al bot y nosotros lo procesamos." },
]

function FadeInSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function Landing() {
  const { user, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  const forestRef = useRef<HTMLDivElement>(null)
  const houseRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.2 })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    lenis.on("scroll", (e: { scroll: number }) => {
      if (forestRef.current) forestRef.current.style.transform = `scale(${1.08 - e.scroll * 0.00002})`
      if (houseRef.current) houseRef.current.style.transform = `scale(${1 + e.scroll * 0.00001})`
    })

    return () => lenis.destroy()
  }, [])

  useEffect(() => {
    if (user) navigate("/dashboard", { replace: true })
  }, [user, navigate])

  const metrics = [
    { icon: Wallet, value: "CLP $0", label: "Sin costos ocultos" },
    { icon: TrendUp, value: "Tiempo real", label: "Sincronización automática" },
    { icon: Receipt, value: "ILIMITADO", label: "Transacciones sin límite" },
  ]

  if (user) return null

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Parallax fondo — 3 capas */}
      <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,214,0,0.12),transparent)] pointer-events-none" />

      <div
        ref={forestRef}
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none will-change-transform origin-center"
        style={{ backgroundImage: "url(/images/paisaje.avif)", opacity: 0.7 }}
      />

      <div
        ref={houseRef}
        className="fixed inset-0 bg-bottom bg-no-repeat pointer-events-none will-change-transform origin-bottom"
        style={{ backgroundImage: "url(/images/casa_solo.jpg)", backgroundSize: "50%", backgroundPosition: "center calc(100% + 100px)"}}
      />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400 text-sm font-bold text-zinc-950">
            W
          </div>
          <span className="text-lg font-semibold tracking-tight">Wally</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <InstallPWA />
          <Button
            onClick={signInWithGoogle}
            className="gap-2 bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-medium"
          >
            <GoogleLogo className="h-4 w-4" />
            Ingresar
          </Button>
        </motion.div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative z-10 mx-auto max-w-6xl px-6 pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={mounted ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Tus finanzas en{" "}
                <span className="text-yellow-400">un solo lugar</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={mounted ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative"
            >
              <div className="absolute -top-8 -right-8 h-28 w-28 z-20">
                <ThreeDollarSign />
              </div>
              <DashboardPreview />
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <FadeInSection>
          <section id="features" className="relative z-10 border-t border-border py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-14 text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Por qué <span className="text-yellow-400">Wally</span>
                </h2>
                <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
                  Olvídate de hojas de cálculo. Tu dinero merece algo mejor.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {features.map((f, i) => (
                  <motion.div
                    key={f.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="group rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:border-border hover:bg-card"
                  >
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* How it works */}
        <FadeInSection>
          <section id="how-it-works" className="relative z-10 border-t border-border py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-14 text-center">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Cómo funciona
                </h2>
                <p className="mt-3 text-muted-foreground">Tres pasos y ya estás listo.</p>
              </div>
              <div className="relative flex flex-col gap-0 md:flex-row md:gap-8">
                {steps.map((s, i) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className="relative flex-1"
                  >
                    <div className="flex flex-col items-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-yellow-400">
                        <s.icon className="h-6 w-6" />
                      </div>
                      <div className="mt-2 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-zinc-950">
                        {i + 1}
                      </div>
                      <h3 className="mt-4 text-lg font-semibold">{s.label}</h3>
                      <p className="mt-1 text-sm text-muted-foreground max-w-xs">{s.desc}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-7 left-[60%] w-[calc(80%)] border-t border-dashed border-border" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Telegram Bot section with improved examples */}
        <FadeInSection>
          <section className="relative z-10 border-t border-border py-20">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid items-center gap-10 md:grid-cols-5">
                <div className="md:col-span-2">
                  <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                    Bot de <span className="text-yellow-400">Telegram</span>
                  </h2>
                  <p className="mt-3 text-muted-foreground">
                    El bot <span className="font-mono text-yellow-400">@WallyBot</span> entiende <strong>lenguaje natural</strong> como una persona real.
                  </p>
                  <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                      <span><strong className="text-card-foreground">Con IA:</strong> entiende contexto, multiplicaciones y sumas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                      <span><strong className="text-card-foreground">Cantidades:</strong> <span className="text-muted-foreground">"4 entradas para el museo 10,000 por 4"</span></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                      <span><strong className="text-card-foreground">Multi-item:</strong> <span className="text-muted-foreground">"remedios por 5000 y vitaminas 3000"</span></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-400" />
                      <span><strong className="text-card-foreground">Vinculación:</strong> Escanea el código QR en la web o usa <span className="font-mono text-yellow-400">/vinculate CODIGO</span></span>
                    </div>
                  </div>
                </div>
                <div className="md:col-span-3">
                  <ChatDemo />
                </div>
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Connection steps */}
        <FadeInSection>
          <section className="relative z-10 border-t border-border py-16 bg-card/50">
            <div className="mx-auto max-w-6xl px-6">
              <div className="mb-10 text-center">
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                  Cómo conectar <span className="text-yellow-400">Telegram</span>
                </h2>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Sigue estos pasos y empieza a registrar gastos en segundos.
                </p>
              </div>
              <div className="mx-auto max-w-2xl space-y-4">
                {[
                  { step: 1, text: "Inicia sesión con Google haciendo clic en \"Comenzar gratis\" arriba." },
                  { step: 2, text: "Ve a Configuración (⚙️) → Conectar Telegram y escanea el código QR." },
                  { step: 3, text: "Abre Telegram en tu celular y busca el bot <span class=\"font-mono\">@WallyBot</span>." },
                  { step: 4, text: "Inicia el chat con el bot y envía: <span class=\"font-mono\">/vinculate</span> seguido del código." },
                  { step: 5, text: "¡Listo! Ahora puedes enviar mensajes y el bot lo registrará automáticamente." },
                ].map((s) => (
                  <motion.div
                    key={s.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: s.step * 0.1, duration: 0.4 }}
                    className="flex items-start gap-4 rounded-xl border border-border bg-card px-5 py-4"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-xs font-bold text-zinc-950">
                      {s.step}
                    </div>
                    <p className="text-sm text-card-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: s.text }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* Metrics */}
        <FadeInSection>
          <section className="relative z-10 border-t border-border py-16">
            <div className="mx-auto max-w-6xl px-6">
              <div className="grid gap-4 md:grid-cols-3">
                {metrics.map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="flex items-center gap-4 rounded-xl border border-border bg-card px-6 py-5"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400">
                      <m.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-bold">{m.value}</p>
                      <p className="text-xs text-muted-foreground">{m.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </FadeInSection>

        {/* CTA */}
        <FadeInSection>
          <section className="relative z-10 border-t border-border py-24">
            <div className="mx-auto max-w-6xl px-6 text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                ¿Listo para tomar el control?
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">
                Únete a Wally y empieza a gestionar tus finanzas de forma inteligente.
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
              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Tus datos están seguros con Supabase
              </div>
            </div>
          </section>
        </FadeInSection>
      </main>

      <Footer variant="landing" />
    </div>
  )
}

function ChatDemo() {
  const messages = [
    { sender: "user", text: "compra en farmacia, remedios por 5000 y vitaminas 3000", delay: 0 },
    { sender: "bot", text: "✅ Gasto registrado: Remedios y vitaminas por $8.000 en Salud.", delay: 1200 },
    { sender: "user", text: "4 entradas para el museo 10,000 por 4", delay: 2400 },
    { sender: "bot", text: "✅ Gasto registrado: Entradas al museo por $40.000 en Entretenimiento.", delay: 3600 },
    { sender: "user", text: "sueldo 500000", delay: 4800 },
    { sender: "bot", text: "💰 Ingreso registrado: Sueldo por $500.000 en Ingresos.", delay: 6000 },
  ]
  const [visible, setVisible] = useState(0)

  useEffect(() => {
    if (visible >= messages.length) return
    const timer = setTimeout(() => setVisible((v) => v + 1), messages[visible].delay)
    return () => clearTimeout(timer)
  }, [visible, messages])

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500">
          <TelegramLogo className="h-3.5 w-3.5 text-white" weight="fill" />
        </div>
        <span className="text-sm font-medium">@WallyBot</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          En línea
        </span>
      </div>
      <div className="space-y-3 min-h-[280px]">
        {messages.slice(0, visible).map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3 }}
            className={msg.sender === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={`rounded-2xl px-3 py-2 text-sm ${
                msg.sender === "user"
                  ? "rounded-br-md bg-yellow-400/10 text-card-foreground"
                  : "rounded-bl-md bg-muted text-card-foreground"
              }`}
            >
              {msg.text}
            </div>
          </motion.div>
        ))}
        {visible < messages.length && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-muted px-3 py-2 text-sm text-muted-foreground animate-pulse">
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40 mx-0.5" />
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40 mx-0.5 animate-pulse" style={{ animationDelay: "0.2s" }} />
              <span className="inline-block h-2 w-2 rounded-full bg-muted-foreground/40 mx-0.5 animate-pulse" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div className="flex justify-start pt-2">
          <div className="rounded-2xl rounded-bl-md bg-muted/50 px-2.5 py-1 text-[10px] text-muted-foreground">
            Envía /ayuda para ver todos los comandos y ejemplos
          </div>
        </div>
      </div>
    </div>
  )
}

function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const barsData = [
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
    { label: "Entretenimiento", value: 12, color: "#9B59B6" },
    { label: "Otros", value: 8, color: "#6B7280" },
  ]
  const maxBar = Math.max(...barsData.map(b => b.value))
  const amountRef = useRef<HTMLSpanElement>(null)

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const bars = el.querySelectorAll<HTMLElement>(".landing-bar")
    const segments = el.querySelectorAll<SVGCircleElement>(".landing-donut-segment")
    const labels = el.querySelectorAll<HTMLElement>(".landing-cat-label")

    gsap.set(bars, { scaleY: 0, transformOrigin: "bottom center" })
    gsap.set(segments, { strokeDasharray: "0 1000" })

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } })

    tl.to(amountRef.current, {
      duration: 1.2,
      textContent: 340000,
      snap: { textContent: 1 },
      ease: "power1.out",
    })

    tl.to(bars, {
      scaleY: 1,
      duration: 0.6,
      stagger: 0.07,
      ease: "back.out(1.4)",
    }, "-=0.6")

    tl.to(segments, {
      strokeDasharray: (i) => {
        const c = categories[i]
        const pct = c.value / categories.reduce((s, c) => s + c.value, 0)
        const circ = 2 * Math.PI * 55
        return `${pct * circ} ${circ}`
      },
      duration: 0.5,
      stagger: 0.12,
      ease: "power1.out",
    }, "-=0.3")

    tl.fromTo(labels,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.05 },
    "-=0.2")
  }, [])

  const donutSize = 140
  const donutCenter = donutSize / 2
  const donutRadius = 55
  const donutStroke = 26
  const donutCirc = 2 * Math.PI * donutRadius
  const total = categories.reduce((s, c) => s + c.value, 0)
  let cumulative = 0

  return (
    <div ref={containerRef} className="rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-yellow-400/5 backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Este mes</p>
          <p className="text-xl font-bold">$ <span ref={amountRef}>0</span></p>
        </div>
        {/* <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-400/10 text-yellow-400">
          <Wallet className="h-4 w-4" />
        </div> */}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-[10px] text-muted-foreground">Top categoría</p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-yellow-400" />
            <p className="text-sm font-semibold">Alimentación</p>
          </div>
          <p className="text-xs text-muted-foreground">$ 153.000</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-[10px] text-muted-foreground">Transacciones</p>
          <p className="mt-1 text-sm font-semibold">24 este mes</p>
          <p className="text-xs text-yellow-400">+3 hoy</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Evolución mensual</p>
        <div className="flex items-end gap-1.5">
          {barsData.map((b) => (
            <div key={b.label} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="landing-bar w-full rounded-t-sm bg-yellow-400/80"
                style={{ height: `${(b.value / maxBar) * 48}px` }}
              />
              <span className="text-[10px] text-muted-foreground">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-medium text-muted-foreground">Por categoría</p>
        <div className="flex flex-col items-center gap-4">
          <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`} className="-rotate-90">
            <circle cx={donutCenter} cy={donutCenter} r={donutRadius} fill="none" stroke="rgb(39 39 42)" strokeWidth={donutStroke} />
            {categories.map((c) => {
              const percent = c.value / total
              const offset = cumulative * donutCirc
              cumulative += percent
              return (
                <circle
                  key={c.label}
                  className="landing-donut-segment"
                  cx={donutCenter}
                  cy={donutCenter}
                  r={donutRadius}
                  fill="none"
                  stroke={c.color}
                  strokeWidth={donutStroke}
                  strokeDasharray={`0 1000`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              )
            })}
          </svg>
          <div ref={ref} className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            {categories.map((c) => (
              <div key={c.label} className="landing-cat-label flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                <span className="text-[10px] text-muted-foreground">{c.label}</span>
                <span className="text-[10px] text-muted-foreground">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
