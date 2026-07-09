import { useState, useMemo, useEffect, useRef } from "react"
import gsap from "gsap"
import { CaretLeft, CaretRight } from "@phosphor-icons/react"

interface UltimosDiasChartProps {
  ingresos: { fecha: string; monto: number }[]
  gastos: { fecha: string; monto: number }[]
}

export function UltimosDiasChart({ ingresos, gastos }: UltimosDiasChartProps) {
  const [dayCount, setDayCount] = useState(5)
  const svgRef = useRef<SVGSVGElement>(null)
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  const days = useMemo(() => {
    const hoy = new Date()
    const dias: { label: string; ingreso: number; gasto: number }[] = []
    for (let i = dayCount - 1; i >= 0; i--) {
      const d = new Date(hoy)
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString("es-CL", { weekday: "short", day: "numeric" })
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      const key = `${y}-${m}-${day}`
      const ingreso = ingresos
        .filter((g) => g.fecha.slice(0, 10) === key)
        .reduce((s, g) => s + Number(g.monto), 0)
      const gasto = gastos
        .filter((g) => g.fecha.slice(0, 10) === key)
        .reduce((s, g) => s + Number(g.monto), 0)
      dias.push({ label, ingreso, gasto })
    }
    return dias
  }, [ingresos, gastos, dayCount])

  const vw = 1200
  const h = 160
  const pad = { top: 12, bottom: 24 }
  const maxVal = Math.max(...days.flatMap((d) => [d.ingreso, d.gasto]), 1)

  const ingresoPoints = days.map((d, i) => {
    const x = (i / (days.length - 1 || 1)) * (vw - 20) + 10
    const y = pad.top + (1 - d.ingreso / maxVal) * (h - pad.top - pad.bottom)
    return { x, y, value: d.ingreso }
  })

  const gastoPoints = days.map((d, i) => {
    const x = (i / (days.length - 1 || 1)) * (vw - 20) + 10
    const y = pad.top + (1 - d.gasto / maxVal) * (h - pad.top - pad.bottom)
    return { x, y, value: d.gasto }
  })

  useEffect(() => {
    if (!svgRef.current || days.length === 0) return
    tlRef.current?.kill()
    const lines = svgRef.current.querySelectorAll<SVGPathElement>(".td-line")
    const dots = svgRef.current.querySelectorAll<SVGCircleElement>(".td-dot")
    gsap.set(dots, { opacity: 0 })
    gsap.set(lines, { strokeDasharray: "2000", strokeDashoffset: 2000 })
    gsap.set(dots, { scale: 0, transformOrigin: "center center" })
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } })
    tl.to(lines, { strokeDashoffset: 0, duration: 0.6, stagger: 0.12 })
    tl.to(dots, { scale: 1, opacity: 1, duration: 0.2, stagger: 0.04 }, "-=0.15")
    tlRef.current = tl
  }, [days])

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setDayCount((n) => Math.max(n - 1, 2))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-card-foreground transition-colors"
          >
            <CaretLeft className="h-3.5 w-3.5" weight="bold" />
          </button>
          <span className="w-10 text-center text-sm font-medium tabular-nums text-card-foreground">{dayCount}</span>
          <button
            onClick={() => setDayCount((n) => Math.min(n + 1, 60))}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-card-foreground transition-colors"
          >
            <CaretRight className="h-3.5 w-3.5" weight="bold" />
          </button>
          <span className="ml-1 text-xs text-muted-foreground">días</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-emerald-400" />
            <span className="text-muted-foreground">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-sm bg-amber-500" />
            <span className="text-muted-foreground">Gastos</span>
          </div>
        </div>
      </div>

      <svg ref={svgRef} width="100%" height={h} viewBox={`0 0 ${vw} ${h}`} preserveAspectRatio="none" className="overflow-visible">
        {ingresoPoints.map((p, i) => (
          <circle key={`ing-${i}`} className="td-dot" cx={p.x} cy={p.y} r={3} fill="#34D399" />
        ))}
        <polyline
          className="td-line"
          points={ingresoPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#34D399"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {gastoPoints.map((p, i) => (
          <circle key={`gst-${i}`} className="td-dot" cx={p.x} cy={p.y} r={3} fill="#F59E0B" />
        ))}
        <polyline
          className="td-line"
          points={gastoPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#F59E0B"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>

      <div className="mt-1.5 flex w-full justify-between px-0.5">
        {days.map((d) => (
          <span key={d.label} className="text-[10px] text-muted-foreground whitespace-nowrap">{d.label}</span>
        ))}
      </div>
    </div>
  )
}
