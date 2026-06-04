import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Gasto } from "@/types"

export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGastos = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from("gastos")
      .select("*")
      .order("fecha", { ascending: false })
    if (!error && data) setGastos(data as Gasto[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    fetchGastos()

    const channel = supabase
      .channel("gastos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "gastos" },
        () => fetchGastos(),
      )
      .subscribe()

    return () => { supabase?.removeChannel(channel) }
  }, [fetchGastos])

  const ahora = new Date()
  const monthStart = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const gastosDelMes = gastos.filter((g) => new Date(g.fecha) >= monthStart)
  const totalGastosMes = gastosDelMes.reduce((s, g) => s + Number(g.monto), 0)

  const categorias: { categoria: string; monto: number }[] = []
  const catMap = new Map<string, number>()
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

  for (let i = 5; i >= 0; i--) {
    const d = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    gastosPorMes.push({
      mes: meses[d.getMonth()],
      monto: mesMap.get(key) ?? 0,
    })
  }

  return {
    gastos,
    gastosDelMes,
    totalGastosMes,
    categorias,
    topCategoria,
    gastosPorMes,
    loading,
    refetch: fetchGastos,
  }
}
