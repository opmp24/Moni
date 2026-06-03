import { Progress } from "@/components/ui/progress"
import { CATEGORIA_COLORS, type Categoria } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface BudgetProgressProps {
  data: { categoria: string; gastado: number; presupuesto: number }[]
}

export function BudgetProgress({ data }: BudgetProgressProps) {
  return (
    <div className="space-y-4">
      {data.map((d) => {
        const porcentaje = Math.min((d.gastado / d.presupuesto) * 100, 100)
        const isOver = d.gastado > d.presupuesto
        const color = CATEGORIA_COLORS[d.categoria as Categoria] ?? "#6B7280"
        return (
          <div key={d.categoria} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {d.categoria}
              </span>
              <span className={isOver ? "text-destructive" : "text-muted-foreground"}>
                {formatCurrency(d.gastado)} / {formatCurrency(d.presupuesto)}
              </span>
            </div>
            <Progress
              value={porcentaje}
              indicatorColor={isOver ? "#EF4444" : color}
            />
          </div>
        )
      })}
    </div>
  )
}
