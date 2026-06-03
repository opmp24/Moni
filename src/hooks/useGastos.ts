import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Gasto, Categoria } from "@/types"

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setGastos(data as Gasto[])
        setLoading(false)
      })
  }, [])

  const gastosDelMes = gastos.filter((g) => {
    const ahora = new Date()
    const fechaGasto = new Date(g.fecha)
    return (
      fechaGasto.getMonth() === ahora.getMonth() &&
      fechaGasto.getFullYear() === ahora.getFullYear()
    )
  })

  const totalMes = gastosDelMes.reduce((s, g) => s + Number(g.monto), 0)

  const categorias: { categoria: Categoria; monto: number }[] = []
  const catMap = new Map<Categoria, number>()
  for (const g of gastosDelMes) {
    catMap.set(g.categoria, (catMap.get(g.categoria) ?? 0) + Number(g.monto))
  }
  for (const [categoria, monto] of catMap) {
    categorias.push({ categoria, monto })
  }

  const topCategoria = categorias.length > 0
    ? categorias.reduce((a, b) => (a.monto > b.monto ? a : b))
    : null

  const gastosPorMes: { mes: string; monto: number }[] = []
  const mesMap = new Map<string, number>()
  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

  for (const g of gastos) {
    const d = new Date(g.fecha)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    mesMap.set(key, (mesMap.get(key) ?? 0) + Number(g.monto))
  }

  const ahora = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    gastosPorMes.push({
      mes: meses[d.getMonth()],
      monto: mesMap.get(key) ?? 0,
    })
  }

  const presupuestos: { categoria: string; gastado: number; presupuesto: number }[] = [
    { categoria: "Alimentación", gastado: 0, presupuesto: 200000 },
    { categoria: "Transporte", gastado: 0, presupuesto: 80000 },
    { categoria: "Vivienda", gastado: 0, presupuesto: 300000 },
    { categoria: "Salud", gastado: 0, presupuesto: 60000 },
    { categoria: "Entretenimiento", gastado: 0, presupuesto: 50000 },
    { categoria: "Otros", gastado: 0, presupuesto: 50000 },
  ]
  for (const g of gastosDelMes) {
    const item = presupuestos.find((p) => p.categoria === g.categoria)
    if (item) item.gastado += Number(g.monto)
  }

  return {
    gastos,
    gastosDelMes,
    totalMes,
    categorias,
    topCategoria,
    gastosPorMes,
    presupuestos,
    loading,
  }
}
