import { useEffect, useRef } from "react"
import gsap from "gsap"

interface BarChartProps {
  data: { mes: string; monto: number }[]
}

export function BarChart({ data }: BarChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const maxMonto = Math.max(...data.map((d) => d.monto), 1)
  const barWidth = 36
  const height = 180
  const padding = 20

  useEffect(() => {
    if (!ref.current) return
    const bars = ref.current.querySelectorAll<HTMLElement>(".barchart-bar")
    gsap.set(bars, { scaleY: 0, transformOrigin: "bottom center" })
    gsap.to(bars, {
      scaleY: 1,
      duration: 0.5,
      stagger: 0.06,
      ease: "back.out(1.4)",
    })
  }, [data])

  return (
    <div ref={ref} className="flex items-end justify-center gap-3 pt-4" style={{ height }}>
      {data.map((d) => {
        const barHeight = (d.monto / maxMonto) * (height - padding * 2)
        return (
          <div key={d.mes} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">
              ${(d.monto / 1000).toFixed(0)}k
            </span>
            <div
              className="barchart-bar w-full rounded-t-md bg-primary"
              style={{
                width: barWidth,
                height: Math.max(barHeight, 4),
              }}
            />
            <span className="text-xs text-muted-foreground">{d.mes}</span>
          </div>
        )
      })}
    </div>
  )
}
