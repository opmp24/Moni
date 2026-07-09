import { useMemo, useEffect, useRef } from "react"
import gsap from "gsap"
import { parseDateSafe } from "@/lib/utils"

interface BalanceChartProps {
  gastosPorMes: { mes: string; monto: number }[]
  ingresos: { fecha: string; monto: number }[]
  gastos: { fecha: string; monto: number }[]
}

export function BalanceChart({ gastosPorMes, ingresos, gastos }: BalanceChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const data = useMemo(() => {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const ahora = new Date()
    const result: { label: string; balance: number }[] = []
    let acum = 0
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
      acum += ing - gst
      result.push({ label: meses[d.getMonth()], balance: acum })
    }
    return result
  }, [gastosPorMes, ingresos, gastos])

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return
    const line = svgRef.current.querySelector<SVGPathElement>(".balance-line")
    const dots = svgRef.current.querySelectorAll<SVGCircleElement>(".balance-dot")
    if (line) {
      gsap.set(line, { strokeDasharray: 1000, strokeDashoffset: 1000 })
      gsap.to(line, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" })
    }
    gsap.set(dots, { scale: 0, transformOrigin: "center center" })
    gsap.to(dots, { scale: 1, duration: 0.2, stagger: 0.06, delay: 0.3 })
  }, [data])

  const maxVal = Math.max(...data.map((d) => Math.abs(d.balance)), 1)
  const w = 240
  const h = 80

  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="overflow-visible">
        {data.map((d, i) => {
          const x = (i / (data.length - 1 || 1)) * w
          const y = h / 2 - (d.balance / maxVal) * (h / 2 * 0.85)
          return (
            <circle key={d.label} cx={x} cy={y} r={3} className="balance-dot fill-yellow-400" />
          )
        })}
        <polyline
          className="balance-line"
          points={data.map((d, i) => {
            const x = (i / (data.length - 1 || 1)) * w
            const y = h / 2 - (d.balance / maxVal) * (h / 2 * 0.85)
            return `${x},${y}`
          }).join(" ")}
          fill="none"
          stroke="rgb(250 204 21)"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <line x1={0} y1={h / 2} x2={w} y2={h / 2} stroke="rgb(63 63 70)" strokeWidth={1} strokeDasharray="3 3" />
      </svg>
      <div className="mt-1 flex w-full justify-between px-1">
        {data.map((d) => (
          <span key={d.label} className="text-[9px] text-muted-foreground">{d.label}</span>
        ))}
      </div>
    </div>
  )
}
