import { useMemo } from "react"

interface WeekChartProps {
  gastos: { fecha: string; monto: number }[]
}

export function WeekChart({ gastos }: WeekChartProps) {
  const days = useMemo(() => {
    const hoy = new Date()
    const dias: { label: string; monto: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy)
      d.setDate(d.getDate() - i)
      const label = d.toLocaleDateString("es-CL", { weekday: "short" })
      const key = d.toISOString().slice(0, 10)
      const monto = gastos
        .filter((g) => g.fecha.slice(0, 10) === key)
        .reduce((s, g) => s + Number(g.monto), 0)
      dias.push({ label, monto })
    }
    return dias
  }, [gastos])

  const maxMonto = Math.max(...days.map((d) => d.monto), 1)

  return (
    <div className="flex items-end justify-center gap-1.5 pt-1">
      {days.map((d) => {
        const h = (d.monto / maxMonto) * 40
        return (
          <div key={d.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm bg-yellow-400/70 transition-all duration-500"
              style={{ height: Math.max(h, 2) }}
            />
            <span className="text-[10px] text-zinc-600">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
