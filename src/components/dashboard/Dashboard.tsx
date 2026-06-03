import { useState } from "react"
import { Wallet, TrendingUp, Receipt, Plus, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DonutChart } from "@/components/dashboard/DonutChart"
import { BarChart } from "@/components/dashboard/BarChart"
import { BudgetProgress } from "@/components/dashboard/BudgetProgress"
import { ExpenseList } from "@/components/ExpenseList"
import { useGastos } from "@/hooks/useGastos"
import { formatCurrency } from "@/lib/utils"

export function Dashboard() {
  const [tab, setTab] = useState("resumen")
  const { gastos, totalMes, categorias, topCategoria, gastosPorMes, presupuestos, loading } = useGastos()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PerJaus</h1>
            <p className="text-sm text-muted-foreground">Control de finanzas personales</p>
          </div>
          <Button>
            <Plus className="mr-1 h-4 w-4" />
            Nuevo gasto
          </Button>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total del mes</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatCurrency(totalMes)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Top categoría</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{topCategoria?.categoria ?? "—"}</p>
              <p className="text-xs text-muted-foreground">
                {topCategoria ? formatCurrency(topCategoria.monto) : "Sin datos"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{gastos.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="detalle">Detalle</TabsTrigger>
          </TabsList>
          <TabsContent value="resumen" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Por categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={categorias} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Evolución mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart data={gastosPorMes} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Presupuesto vs real</CardTitle>
                </CardHeader>
                <CardContent>
                  <BudgetProgress data={presupuestos} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="detalle">
            <Card>
              <CardHeader>
                <CardTitle>Todos los gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={gastos} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
