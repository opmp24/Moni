import { useState, useEffect, useRef } from "react"
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
import { MarqueeBar } from "@/components/MarqueeBar"
import { MetasPanel } from "@/components/MetasPanel"
import { CompromisosPanel } from "@/components/CompromisosPanel"
import { BudgetSettings } from "@/components/BudgetSettings"
import { CategoryEditor } from "@/components/CategoryEditor"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { SettingsPopup } from "@/components/SettingsPopup"
import { DashboardFooter } from "@/components/Footer"
import { useGastos } from "@/hooks/useGastos"
import { useIngresos } from "@/hooks/useIngresos"
import { usePresupuestos } from "@/hooks/usePresupuestos"
import { useCategorias } from "@/hooks/useCategorias"
import { useAuth } from "@/lib/auth"
import { formatCurrency, parseDateSafe } from "@/lib/utils"
import { WeekChart } from "@/components/dashboard/WeekChart"
import { BalanceChart } from "@/components/dashboard/BalanceChart"
import { IngresoVsGastoChart } from "@/components/dashboard/IngresoVsGastoChart"
import { UltimosDiasChart } from "@/components/dashboard/UltimosDiasChart"
import { duplicarRecurrentes } from "@/lib/recurrentes"
import gsap from "gsap"

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
  const { getColor } = useCategorias()
  const cardsRef = useRef<HTMLDivElement>(null)

  const ahora = new Date()
  const mesPasado = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
  const mesPasadoEnd = new Date(ahora.getFullYear(), ahora.getMonth(), 0, 23, 59, 59)

  const gastosMesPasado = gastos.filter((g) => {
    const d = parseDateSafe(g.fecha)
    return d >= mesPasado && d <= mesPasadoEnd
  })
  const ingresosMesPasado = ingresos.filter((g) => {
    const d = parseDateSafe(g.fecha)
    return d >= mesPasado && d <= mesPasadoEnd
  })
  const totalGastosMP = gastosMesPasado.reduce((s, g) => s + Number(g.monto), 0)
  const totalIngresosMP = ingresosMesPasado.reduce((s, g) => s + Number(g.monto), 0)
  const balanceMP = totalIngresosMP - totalGastosMP

  const loading = loadingGastos || loadingIngresos || loadingPresupuestos
  const balance = totalIngresosMes - totalGastosMes
  const diffGastos = totalGastosMP > 0 ? ((totalGastosMes - totalGastosMP) / totalGastosMP) * 100 : 0
  const diffIngresos = totalIngresosMP > 0 ? ((totalIngresosMes - totalIngresosMP) / totalIngresosMP) * 100 : 0
  const diffBalance = balanceMP !== 0 ? ((balance - balanceMP) / Math.abs(balanceMP)) * 100 : 0
  const transaccionesTotales = gastos.length + ingresos.length

  useEffect(() => {
    if (!cardsRef.current || loading) return
    const cards = cardsRef.current.querySelectorAll<HTMLElement>(".dashboard-card")
    gsap.fromTo(cards,
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out" }
    )
  }, [loading])

  useEffect(() => {
    if (tab !== "resumen") return
    const cards = document.querySelectorAll<HTMLElement>(".dashboard-card-resumen")
    if (cards.length === 0) return
    gsap.fromTo(cards,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: "power2.out" }
    )
  }, [tab, loading])

  useEffect(() => {
    if (!user?.id) return
    duplicarRecurrentes(user.id)
  }, [user?.id])

  const presupuestosConGasto = presupuestos.map((p) => {
    const gastado = gastosDelMes
      .filter((g) => g.categoria === p.categoria)
      .reduce((s, g) => s + Number(g.monto), 0)
    return { categoria: p.categoria, gastado, presupuesto: p.monto }
  })

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,214,0,0.08),transparent)] pointer-events-none" />
      <div className="relative z-10 space-y-6 p-4 md:p-6 lg:p-8">
        <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border">
              <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-semibold text-muted-foreground">
                {(user?.user_metadata?.full_name ?? user?.email ?? "U").charAt(0).toUpperCase()}
              </div>
              {user?.user_metadata?.avatar_url && (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
                />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Wally</h1>
              <p className="truncate text-sm text-muted-foreground">
                {user?.user_metadata?.full_name ?? user?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AddExpenseDialog open={expenseOpen} onOpenChange={setExpenseOpen} onSaved={refetchGastos} />
            <AddIncomeDialog open={incomeOpen} onOpenChange={setIncomeOpen} onSaved={refetchIngresos} />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              title="Configuración"
              className="h-10 w-10 border-border text-card-foreground hover:border-yellow-500/50 hover:bg-accent hover:text-yellow-400"
            >
              <GearSix className="h-5 w-5" weight="bold" />
            </Button>
          </div>
        </header>

        <TelegramLink />

        <MarqueeBar gastos={gastos} />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="dashboard-card card-glow border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Balance del mes</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" weight="bold" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-400" : "text-destructive"}`}>
                {formatCurrency(Math.abs(balance))}
                <span className="ml-1 text-sm">{balance >= 0 ? "a favor" : "en contra"}</span>
              </p>
              {diffBalance !== 0 && (
                <p className={`mt-0.5 text-[10px] ${diffBalance > 0 ? "text-emerald-500" : "text-red-500"}`}>
                  {diffBalance > 0 ? "▲" : "▼"} {Math.abs(diffBalance).toFixed(0)}% vs mes pasado
                </p>
              )}
              <div className="mt-2 flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-emerald-500" weight="bold" />
                  <span className="text-muted-foreground">Ingresos</span>
                  <span className="font-medium text-emerald-400">{formatCurrency(totalIngresosMes)}</span>
                  {diffIngresos !== 0 && (
                    <span className={`text-[10px] ${diffIngresos > 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {diffIngresos > 0 ? "▲" : "▼"}{Math.abs(diffIngresos).toFixed(0)}%
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3 text-red-500" weight="bold" />
                  <span className="text-muted-foreground">Gastos</span>
                  <span className="font-medium text-card-foreground">{formatCurrency(totalGastosMes)}</span>
                  {diffGastos !== 0 && (
                    <span className={`text-[10px] ${diffGastos > 0 ? "text-red-500" : "text-emerald-500"}`}>
                      {diffGastos > 0 ? "▲" : "▼"}{Math.abs(diffGastos).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="dashboard-card card-glow border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Top categoría</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {topCategoria && (
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: getColor(topCategoria.categoria) }}
                  />
                )}
                <p className="text-2xl font-bold text-foreground">{topCategoria?.categoria ?? "—"}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {topCategoria ? formatCurrency(topCategoria.monto) : "Sin datos"}
              </p>
            </CardContent>
          </Card>
          <Card className="dashboard-card card-glow border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Transacciones</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{transaccionesTotales}</p>
              <p className="mb-1 mt-2 text-[10px] text-muted-foreground">Últimos 7 días</p>
              <WeekChart gastos={gastos} />
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="border-border bg-muted">
            <TabsTrigger value="resumen" className="text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Resumen
            </TabsTrigger>
            <TabsTrigger value="gastos" className="text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Gastos
            </TabsTrigger>
            <TabsTrigger value="ingresos" className="text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">
              Ingresos
            </TabsTrigger>
          </TabsList>
          <TabsContent value="resumen" className="space-y-4">
            <div ref={cardsRef} className="grid gap-4 md:grid-cols-2">
              <Card className="dashboard-card-resumen card-glow border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Por categoría</CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={categorias} />
                </CardContent>
              </Card>
              <Card className="dashboard-card-resumen card-glow border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Evolución mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart data={gastosPorMes} />
                </CardContent>
              </Card>
              <Card className="dashboard-card-resumen card-glow border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Presupuesto vs real</CardTitle>
                  <BudgetSettings open={budgetOpen} onOpenChange={setBudgetOpen} onSaved={refetchPresupuestos} />
                </CardHeader>
                <CardContent>
                  <BudgetProgress data={presupuestosConGasto} />
                </CardContent>
              </Card>
              <Card className="dashboard-card-resumen card-glow border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Tendencia diaria</CardTitle>
                </CardHeader>
                <CardContent>
                  <UltimosDiasChart ingresos={ingresos} gastos={gastos} />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="dashboard-card-resumen card-glow border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Balance acumulado</CardTitle>
                </CardHeader>
                <CardContent>
                  <BalanceChart gastosPorMes={gastosPorMes} ingresos={ingresos} gastos={gastos} />
                </CardContent>
              </Card>
              <Card className="dashboard-card-resumen card-glow border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm text-muted-foreground">Ingresos vs Gastos</CardTitle>
                </CardHeader>
                <CardContent>
                  <IngresoVsGastoChart gastosPorMes={gastosPorMes} ingresos={ingresos} gastos={gastos} />
                </CardContent>
              </Card>
            </div>
            <Card className="dashboard-card-resumen card-glow border-border bg-card">
              <CardContent className="pt-6">
                <MetasPanel />
              </CardContent>
            </Card>
            <Card className="dashboard-card-resumen card-glow border-border bg-card">
              <CardContent className="pt-6">
                <CompromisosPanel />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gastos">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Todos los gastos</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpenseList expenses={gastos} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ingresos">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">Todos los ingresos</CardTitle>
              </CardHeader>
              <CardContent>
                <IncomeList ingresos={ingresos} />
              </CardContent>
            </Card>
          </TabsContent>
      </Tabs>
      </div>

      <DashboardFooter totalGastosMes={totalGastosMes} totalIngresosMes={totalIngresosMes} balance={balance} userEmail={user?.email} />

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
