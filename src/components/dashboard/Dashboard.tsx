import { useState } from "react"
import { TrendingUp, Receipt, Loader2 } from "lucide-react"
import { GearSix, ArrowUpRight, ArrowDownRight, Wallet } from "@phosphor-icons/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DonutChart } from "@/components/dashboard/DonutChart"
import { BarChart } from "@/components/dashboard/BarChart"
import { BudgetProgress } from "@/components/dashboard/BudgetProgress"
import { ExpenseList } from "@/components/ExpenseList"
import { IncomeList } from "@/components/IncomeList"
import { AddExpenseDialog } from "@/components/AddExpenseDialog"
import { AddIncomeDialog } from "@/components/AddIncomeDialog"
import { TelegramLink } from "@/components/TelegramLink"
import { BudgetSettings } from "@/components/BudgetSettings"
import { CategoryEditor } from "@/components/CategoryEditor"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { SettingsPopup } from "@/components/SettingsPopup"
import { useGastos } from "@/hooks/useGastos"
import { useIngresos } from "@/hooks/useIngresos"
import { usePresupuestos } from "@/hooks/usePresupuestos"
import { useAuth } from "@/lib/auth"
import { CATEGORIA_COLORS } from "@/types"
import { formatCurrency } from "@/lib/utils"

export function Dashboard() {
  const [tab, setTab] = useState("resumen")
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { gastos, gastosDelMes, totalGastosMes, categorias, topCategoria, gastosPorMes, loading: loadingGastos, refetch: refetchGastos } = useGastos()
  const { ingresos, totalIngresosMes, loading: loadingIngresos, refetch: refetchIngresos } = useIngresos()
  const { presupuestos, loading: loadingPresupuestos, refetch: refetchPresupuestos } = usePresupuestos()

  const loading = loadingGastos || loadingIngresos || loadingPresupuestos
  const balance = totalIngresosMes - totalGastosMes
  const transaccionesTotales = gastos.length + ingresos.length

  const presupuestosConGasto = presupuestos.map((p) => {
    const gastado = gastosDelMes
      .filter((g) => g.categoria === p.categoria)
      .reduce((s, g) => s + Number(g.monto), 0)
    return { categoria: p.categoria, gastado, presupuesto: p.monto }
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,214,0,0.08),transparent)] pointer-events-none" />
      <div className="relative z-10 mx-auto max-w-6xl space-y-6 p-4 md:p-6 lg:p-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">PerJaus</h1>
            <p className="text-sm text-zinc-500">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <AddExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} onSaved={refetchGastos} />
            <AddIncomeDialog open={incomeOpen} onOpenChange={setIncomeOpen} onSaved={refetchIngresos} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              title="Configuración"
              className="border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
            >
              <GearSix className="h-4 w-4" weight="bold" />
            </Button>
          </div>
        </header>

        <TelegramLink />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Balance del mes</CardTitle>
              <Wallet className="h-4 w-4 text-zinc-600" weight="bold" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {formatCurrency(Math.abs(balance))}
                <span className="ml-1 text-sm">{balance >= 0 ? "a favor" : "en contra"}</span>
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" weight="bold" />
                  <span className="text-zinc-500">Ingresos</span>
                  <span className="font-medium text-emerald-400">{formatCurrency(totalIngresosMes)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3 text-red-500" weight="bold" />
                  <span className="text-zinc-500">Gastos</span>
                  <span className="font-medium text-zinc-200">{formatCurrency(totalGastosMes)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Top categoría</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {topCategoria && (
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: CATEGORIA_COLORS[topCategoria.categoria] ?? "#6B7280" }}
                  />
                )}
                <p className="text-2xl font-bold text-zinc-100">{topCategoria?.categoria ?? "—"}</p>
              </div>
              <p className="text-xs text-zinc-500">
                {topCategoria ? formatCurrency(topCategoria.monto) : "Sin datos"}
              </p>
            </CardContent>
          </Card>
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Transacciones</CardTitle>
              <Receipt className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-zinc-100">{transaccionesTotales}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="border-zinc-800 bg-zinc-900">
            <TabsTrigger value="resumen" className="text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="gastos" className="text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
              Gastos
            </TabsTrigger>
            <TabsTrigger value="ingresos" className="text-zinc-400 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
              Ingresos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="resumen" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-sm text-zinc-400">Por categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={categorias} />
                </CardContent>
              </Card>
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-sm text-zinc-400">Evolución mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart data={gastosPorMes} />
                </CardContent>
              </Card>
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-zinc-400">Presupuesto vs real</CardTitle>
                  <BudgetSettings open={budgetOpen} onOpenChange={setBudgetOpen} onSaved={refetchPresupuestos} />
                </CardHeader>
                <CardContent>
                  <BudgetProgress data={presupuestosConGasto} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="gastos">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-400">Todos los gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={gastos} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ingresos">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="text-sm text-zinc-400">Todos los ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeList ingresos={ingresos} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <SettingsPopup
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onPresupuestos={() => setBudgetOpen(true)}
        onCategorias={() => setCategoryEditorOpen(true)}
        onGasto={() => setExpenseOpen(true)}
        onIngreso={() => setIncomeOpen(true)}
        onCerrarSesion={signOut}
      />

      <ErrorBoundary>
        <CategoryEditor open={categoryEditorOpen} onOpenChange={setCategoryEditorOpen} />
      </ErrorBoundary>
    </div>
  )
}
