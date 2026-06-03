import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CATEGORIA_COLORS, type Gasto } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ExpenseListProps {
  expenses: Gasto[]
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Concepto</TableHead>
          <TableHead>Categoría</TableHead>
          <TableHead className="text-right">Monto</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {expenses.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground">
              No hay gastos registrados
            </TableCell>
          </TableRow>
        ) : (
          expenses.map((gasto) => (
            <TableRow key={gasto.id}>
              <TableCell className="text-muted-foreground">
                {formatDate(gasto.fecha)}
              </TableCell>
              <TableCell className="font-medium">{gasto.concepto}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className="border-0 text-white"
                  style={{ backgroundColor: CATEGORIA_COLORS[gasto.categoria] }}
                >
                  {gasto.categoria}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(gasto.monto)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
