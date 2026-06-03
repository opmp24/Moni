import { CATEGORIA_COLORS, type Categoria } from "@/types"

interface DonutChartProps {
  data: { categoria: Categoria; monto: number }[]
}

export function DonutChart({ data }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.monto, 0)
  if (total === 0) return <p className="text-sm text-muted-foreground">Sin datos</p>

  let cumulativeAngle = 0
  const slices = data.map((d) => {
    const angle = (d.monto / total) * 360
    const startAngle = cumulativeAngle
    cumulativeAngle += angle
    return { ...d, startAngle, angle, percentage: (d.monto / total) * 100 }
  })

  const size = 200
  const center = size / 2
  const radius = 80
  const innerRadius = 50

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArc(
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ) {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0
    const outer = polarToCartesian(cx, cy, r, startAngle)
    const innerStart = polarToCartesian(cx, cy, innerRadius, endAngle)
    const innerEnd = polarToCartesian(cx, cy, innerRadius, startAngle)

    return [
      `M ${outer.x} ${outer.y}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${start.x} ${start.y}`,
      `L ${innerStart.x} ${innerStart.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerEnd.x} ${innerEnd.y}`,
      "Z",
    ].join(" ")
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s) => (
          <path
            key={s.categoria}
            d={describeArc(center, center, radius, s.startAngle, s.startAngle + s.angle)}
            fill={CATEGORIA_COLORS[s.categoria]}
            stroke="hsl(var(--background))"
            strokeWidth={2}
          />
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-2">
        {slices.map((s) => (
          <div key={s.categoria} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: CATEGORIA_COLORS[s.categoria] }}
            />
            <span className="text-muted-foreground">{s.categoria}</span>
            <span className="font-medium">{s.percentage.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
