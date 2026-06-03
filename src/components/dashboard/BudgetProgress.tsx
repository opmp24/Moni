import { Progress } from "@/components/ui/progress"
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
        return (
          <div key={d.categoria} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{d.categoria}</span>
              <span className={isOver ? "text-destructive" : "text-muted-foreground"}>
                {formatCurrency(d.gastado)} / {formatCurrency(d.presupuesto)}
              </span>
            </div>
            <Progress
              value={porcentaje}
              className={isOver ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}
            />
          </div>
        )
      })}
    </div>
  )
}
