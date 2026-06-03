"use client"

import { useState } from "react"
import { Wallet, TrendingUp, Receipt, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DonutChart } from "@/components/dashboard/DonutChart"
import { BarChart } from "@/components/dashboard/BarChart"
import { BudgetProgress } from "@/components/dashboard/BudgetProgress"
import { ExpenseList } from "@/components/ExpenseList"
import { formatCurrency } from "@/lib/utils"
import { type Categoria, type Gasto } from "@/types"

const MOCK_GASTOS: Gasto[] = [
  { id: "1", monto: 15000, concepto: "Helados", categoria: "Entretenimiento", fecha: "2026-06-03T12:00:00Z", created_at: "2026-06-03T12:00:00Z" },
  { id: "2", monto: 35000, concepto: "Supermercado", categoria: "Alimentación", fecha: "2026-06-02T10:00:00Z", created_at: "2026-06-02T10:00:00Z" },
  { id: "3", monto: 8000, concepto: "Micro", categoria: "Transporte", fecha: "2026-06-01T08:00:00Z", created_at: "2026-06-01T08:00:00Z" },
  { id: "4", monto: 250000, concepto: "Arriendo", categoria: "Vivienda", fecha: "2026-05-28T09:00:00Z", created_at: "2026-05-28T09:00:00Z" },
  { id: "5", monto: 45000, concepto: "Farmacia", categoria: "Salud", fecha: "2026-05-25T14:00:00Z", created_at: "2026-05-25T14:00:00Z" },
  { id: "6", monto: 12000, concepto: "Cine", categoria: "Entretenimiento", fecha: "2026-05-22T20:00:00Z", created_at: "2026-05-22T20:00:00Z" },
  { id: "7", monto: 22000, concepto: "Gasolina", categoria: "Transporte", fecha: "2026-05-20T11:00:00Z", created_at: "2026-05-20T11:00:00Z" },
  { id: "8", monto: 80000, concepto: "Restaurante", categoria: "Alimentación", fecha: "2026-05-18T13:00:00Z", created_at: "2026-05-18T13:00:00Z" },
]

const CATEGORIA_TOTALS: { categoria: Categoria; monto: number }[] = [
  { categoria: "Alimentación", monto: 115000 },
  { categoria: "Transporte", monto: 30000 },
  { categoria: "Vivienda", monto: 250000 },
  { categoria: "Salud", monto: 45000 },
  { categoria: "Entretenimiento", monto: 27000 },
  { categoria: "Otros", monto: 5000 },
]

const MONTHLY_DATA = [
  { mes: "Ene", monto: 420000 },
  { mes: "Feb", monto: 380000 },
  { mes: "Mar", monto: 510000 },
  { mes: "Abr", monto: 460000 },
  { mes: "May", monto: 490000 },
  { mes: "Jun", monto: 58000 },
]

const BUDGET_DATA = [
  { categoria: "Alimentación", gastado: 115000, presupuesto: 200000 },
  { categoria: "Transporte", gastado: 30000, presupuesto: 80000 },
  { categoria: "Vivienda", gastado: 250000, presupuesto: 300000 },
  { categoria: "Salud", gastado: 45000, presupuesto: 60000 },
  { categoria: "Entretenimiento", gastado: 27000, presupuesto: 50000 },
]

export function Dashboard() {
  const [tab, setTab] = useState("resumen")
  const totalMes = CATEGORIA_TOTALS.reduce((s, c) => s + c.monto, 0)
  const topCat = [...CATEGORIA_TOTALS].sort((a, b) => b.monto - a.monto)[0]

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
              <p className="text-2xl font-bold">{topCat?.categoria}</p>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(topCat?.monto ?? 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{MOCK_GASTOS.length}</p>
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
                  <DonutChart data={CATEGORIA_TOTALS} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Evolución mensual</CardTitle>
                </CardHeader>
                <CardContent>
                  <BarChart data={MONTHLY_DATA} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Presupuesto vs real</CardTitle>
                </CardHeader>
                <CardContent>
                  <BudgetProgress data={BUDGET_DATA} />
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
                <ExpenseList expenses={MOCK_GASTOS} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
