interface BarChartProps {
  data: { mes: string; monto: number }[]
}

export function BarChart({ data }: BarChartProps) {
  const maxMonto = Math.max(...data.map((d) => d.monto), 1)
  const barWidth = 36
  const height = 180
  const padding = 20

  return (
    <div className="flex items-end justify-center gap-3 pt-4" style={{ height }}>
      {data.map((d) => {
        const barHeight = (d.monto / maxMonto) * (height - padding * 2)
        return (
          <div key={d.mes} className="flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">
              ${(d.monto / 1000).toFixed(0)}k
            </span>
            <div
              className="w-full rounded-t-md bg-primary transition-all"
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
