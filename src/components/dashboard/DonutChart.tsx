import { useCategorias } from "@/hooks/useCategorias"

interface DonutChartProps {
  data: { categoria: string; monto: number }[]
}

export function DonutChart({ data }: DonutChartProps) {
  const { getColor } = useCategorias()
  const total = data.reduce((sum, d) => sum + d.monto, 0)
  if (total === 0) return <p className="py-4 text-center text-sm text-muted-foreground">Sin datos</p>

  const size = 180
  const center = size / 2
  const radius = 72
  const strokeWidth = 32
  const circumference = 2 * Math.PI * radius

  let cumulativePercent = 0

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="rgb(39 39 42)" strokeWidth={strokeWidth} />
        {data.map((d) => {
          const percent = d.monto / total
          const offset = cumulativePercent * circumference
          const length = percent * circumference
          cumulativePercent += percent
          return (
            <circle
              key={d.categoria}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={getColor(d.categoria)}
              strokeWidth={strokeWidth}
              strokeDasharray={`${length} ${circumference - length}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          )
        })}
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((d) => (
          <div key={d.categoria} className="flex items-center gap-2 text-xs">
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
