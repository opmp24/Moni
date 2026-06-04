import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import type { Presupuesto } from "@/types"

export function usePresupuestos() {
  const { user } = useAuth()
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPresupuestos = useCallback(async () => {
    if (!supabase || !user) return
    const ahora = new Date()
    const mesStart = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`

    const { data, error } = await supabase
      .from("presupuestos")
      .select("*")
      .eq("user_id", user.id)
      .eq("mes", mesStart)
    if (!error && data) setPresupuestos(data as Presupuesto[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    fetchPresupuestos()

    const channel = supabase
      .channel("presupuestos-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "presupuestos" },
        () => fetchPresupuestos(),
      )
      .subscribe()

    return () => { supabase?.removeChannel(channel) }
  }, [fetchPresupuestos])

  const upsertPresupuesto = async (categoria: string, monto: number) => {
    if (!supabase) return
    const ahora = new Date()
    const mesStart = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`

    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return

    const existing = presupuestos.find((p) => p.categoria === categoria)
    if (existing) {
      await supabase
        .from("presupuestos")
        .update({ monto, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
    } else {
      await supabase
        .from("presupuestos")
        .insert({ user_id: user.user.id, categoria, mes: mesStart, monto })
    }
    fetchPresupuestos()
  }

  return {
    presupuestos,
    loading,
    upsertPresupuesto,
    refetch: fetchPresupuestos,
  }
}
