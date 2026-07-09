import { useEffect, useRef } from "react"
import gsap from "gsap"
import { useCategorias } from "@/hooks/useCategorias"

interface DonutChartProps {
  data: { categoria: string; monto: number }[]
}

export function DonutChart({ data }: DonutChartProps) {
  const { getColor } = useCategorias()
  const ref = useRef<HTMLDivElement>(null)
  const total = data.reduce((sum, d) => sum + d.monto, 0)
  if (total === 0) return <p className="py-4 text-center text-sm text-muted-foreground">Sin datos</p>

  const size = 180
  const center = size / 2
  const radius = 72
  const strokeWidth = 32
  const circumference = 2 * Math.PI * radius

  useEffect(() => {
    if (!ref.current) return
    const segments = ref.current.querySelectorAll<SVGCircleElement>(".donut-segment")
    const labels = ref.current.querySelectorAll<HTMLElement>(".donut-label")
    gsap.set(segments, { strokeDasharray: "0 1000" })
    gsap.set(labels, { autoAlpha: 0, y: 6 })
    gsap.to(segments, {
      strokeDasharray: (i) => {
        const d = data[i]
        if (!d) return "0 1000"
        const pct = d.monto / total
        return `${pct * circumference} ${circumference}`
      },
      duration: 0.6,
      stagger: 0.08,
      ease: "power1.out",
    })
    gsap.to(labels, { autoAlpha: 1, y: 0, duration: 0.25, stagger: 0.04, delay: 0.4 })
  }, [data])

  let cumulativePercent = 0

  return (
    <div ref={ref} className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgb(39 39 42)" strokeWidth={strokeWidth} />
        {data.map((d) => {
          const percent = d.monto / total
          const offset = cumulativePercent * circumference
          cumulativePercent += percent
          return (
            <circle
              key={d.categoria}
              className="donut-segment"
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={getColor(d.categoria)}
              strokeWidth={strokeWidth}
              strokeDasharray="0 1000"
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
        })}
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <div key={d.categoria} className="donut-label flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: getColor(d.categoria) }}
            />
            <span className="text-muted-foreground">{d.categoria}</span>
            <span className="font-medium text-card-foreground">
              {new Intl.NumberFormat("es-CL", { style: "percent", maximumFractionDigits: 0 }).format(d.monto / total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
