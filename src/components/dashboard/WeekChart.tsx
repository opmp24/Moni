import { useMemo, useEffect, useRef } from "react"
import gsap from "gsap"

interface WeekChartProps {
  gastos: { fecha: string; monto: number }[]
}

export function WeekChart({ gastos }: WeekChartProps) {
  const ref = useRef<HTMLDivElement>(null)
  const days = useMemo(() => {
    const hoy = new Date()
    const dias: { label: string; monto: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy)
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString("es-CL", { weekday: "short" })
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const day = String(d.getDate()).padStart(2, "0")
      const key = `${y}-${m}-${day}`
      const monto = gastos
        .filter((g) => g.fecha.slice(0, 10) === key)
        .reduce((s, g) => s + Number(g.monto), 0)
      dias.push({ label, monto })
    }
    return dias
  }, [gastos])

  const maxMonto = Math.max(...days.map((d) => d.monto), 1)

  useEffect(() => {
    if (!ref.current) return
    const bars = ref.current.querySelectorAll<HTMLElement>(".weekchart-bar")
    gsap.set(bars, { scaleY: 0, transformOrigin: "bottom center" })
    gsap.to(bars, { scaleY: 1, duration: 0.4, stagger: 0.05, ease: "back.out(1.2)" })
  }, [days])

  return (
    <div ref={ref} className="flex items-end justify-center gap-1.5 pt-1">
      {days.map((d) => {
        const h = (d.monto / maxMonto) * 40
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="weekchart-bar w-full rounded-t-sm bg-yellow-400/70"
              style={{ height: Math.max(h, 2) }}
            />
            <span className="text-[10px] text-muted-foreground">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
