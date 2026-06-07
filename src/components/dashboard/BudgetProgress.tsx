import { Progress } from "@/components/ui/progress"
import { useCategorias } from "@/hooks/useCategorias"
import { formatCurrency } from "@/lib/utils"
import { WarningCircle } from "@phosphor-icons/react"

interface BudgetProgressProps {
  data: { categoria: string; gastado: number; presupuesto: number }[]
}

export function BudgetProgress({ data }: BudgetProgressProps) {
  const { getColor } = useCategorias()
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <p className="text-sm text-muted-foreground">Sin presupuestos configurados</p>
        <p className="text-xs text-muted-foreground">
            Usa el lápiz ✏️ o envía <code className="rounded bg-muted px-1 py-0.5 text-muted-foreground">/presupuesto Categoria monto</code> a @PerJausBot
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data.map((d) => {
        const porcentajeReal = (d.gastado / d.presupuesto) * 100
        const isOver = d.gastado > d.presupuesto
        const isWarning = !isOver && porcentajeReal >= 80
        const color = getColor(d.categoria)
        return (
          <div key={d.categoria} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {d.categoria}
                {isWarning && <WarningCircle className="h-3.5 w-3.5 text-yellow-400" weight="fill" />}
                {isOver && <WarningCircle className="h-3.5 w-3.5 text-destructive" weight="fill" />}
              </span>
              <span className={isOver ? "text-destructive" : "text-muted-foreground"}>
                {formatCurrency(d.gastado)} / {formatCurrency(d.presupuesto)}
              </span>
            </div>
            <Progress
              value={Math.min(porcentajeReal, 100)}
              indicatorColor={isOver ? "#EF4444" : color}
            />
          </div>
        )
      })}
    </div>
  )
}
