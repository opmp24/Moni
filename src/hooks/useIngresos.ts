import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import type { Ingreso } from "@/types"

export function useIngresos() {
  const [ingresos, setIngresos] = useState<Ingreso[]>([])
  const [loading, setLoading] = useState(true)

  const fetchIngresos = useCallback(async () => {
    if (!supabase) return
    const { data, error } = await supabase
      .from("ingresos")
      .select("*")
      .order("fecha", { ascending: false })
    if (!error && data) setIngresos(data as Ingreso[])
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    fetchIngresos()

    const channel = supabase
      .channel("ingresos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ingresos" },
        () => fetchIngresos(),
      )
      .subscribe()

    return () => { supabase?.removeChannel(channel) }
  }, [fetchIngresos])

  const ahora = new Date()
  const monthStart = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

  const ingresosDelMes = ingresos.filter((g) => new Date(g.fecha) >= monthStart)
  const totalIngresosMes = ingresosDelMes.reduce((s, g) => s + Number(g.monto), 0)

  return {
    ingresos,
    ingresosDelMes,
    totalIngresosMes,
    loading,
    refetch: fetchIngresos,
  }
}
