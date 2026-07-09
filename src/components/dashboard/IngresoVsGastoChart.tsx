import { useMemo, useEffect, useRef } from "react"
import gsap from "gsap"
import { parseDateSafe } from "@/lib/utils"

interface IngresoVsGastoChartProps {
  gastosPorMes: { mes: string; monto: number }[]
  ingresos: { fecha: string; monto: number }[]
  gastos: { fecha: string; monto: number }[]
}

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export function IngresoVsGastoChart({ gastosPorMes, ingresos, gastos }: IngresoVsGastoChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  const data = useMemo(() => {
    const ahora = new Date()
    const result: { label: string; ingreso: number; gasto: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const ing = ingresos
        .filter((g) => {
          const f = parseDateSafe(g.fecha)
          return `${f.getFullYear()}-${f.getMonth()}` === key
        })
        .reduce((s, g) => s + Number(g.monto), 0)
      const gst = gastos
        .filter((g) => {
          const f = parseDateSafe(g.fecha)
          return `${f.getFullYear()}-${f.getMonth()}` === key
        })
        .reduce((s, g) => s + Number(g.monto), 0)
      result.push({ label: MESES[d.getMonth()], ingreso: ing, gasto: gst })
    }
    return result
  }, [gastosPorMes, ingresos, gastos])

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return
    const lines = svgRef.current.querySelectorAll<SVGPathElement>(".chart-line")
    const dots = svgRef.current.querySelectorAll<SVGCircleElement>(".chart-dot")
    gsap.set(lines, { strokeDasharray: "1000", strokeDashoffset: 1000 })
    gsap.set(dots, { scale: 0, transformOrigin: "center center" })
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } })
    tl.to(lines, { strokeDashoffset: 0, duration: 0.8, stagger: 0.15 })
    tl.to(dots, { scale: 1, duration: 0.25, stagger: 0.04 }, "-=0.2")
  }, [data])

  const maxVal = Math.max(...data.flatMap((d) => [d.ingreso, d.gasto]), 1)
  const w = 240
  const h = 90
  const pad = { top: 8, bottom: 8 }

  const ingresoPoints = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * w
    const y = pad.top + (1 - d.ingreso / maxVal) * (h - pad.top - pad.bottom)
    return { x, y, label: d.label, value: d.ingreso }
  })

  const gastoPoints = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * w
    const y = pad.top + (1 - d.gasto / maxVal) * (h - pad.top - pad.bottom)
    return { x, y, label: d.label, value: d.gasto }
  })

  return (
    <div className="flex flex-col items-center">
      <div className="mb-2 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-emerald-400" />
          <span className="text-muted-foreground">Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-4 rounded-sm bg-red-400" />
          <span className="text-muted-foreground">Gastos</span>
        </div>
      </div>
      <svg ref={svgRef} width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
        {ingresoPoints.map((p, i) => (
          <circle
            key={`ing-${i}`}
            className="chart-dot"
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill="#34D399"
          />
        ))}
        <polyline
          className="chart-line"
          points={ingresoPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#34D399"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {gastoPoints.map((p, i) => (
          <circle
            key={`gst-${i}`}
            className="chart-dot"
            cx={p.x}
            cy={p.y}
            r={2.5}
            fill="#F87171"
          />
        ))}
        <polyline
          className="chart-line"
          points={gastoPoints.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#F87171"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
      <div className="mt-1 flex w-full justify-between px-1">
        {data.map((d) => (
          <span key={d.label} className="text-[9px] text-muted-foreground">{d.label}</span>
        ))}
      </div>
    </div>
  )
}
