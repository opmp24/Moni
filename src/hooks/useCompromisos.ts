import { useState, useEffect, useCallback, useId } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import type { Compromiso, Categoria } from "@/types"
import { parseDateSafe } from "@/lib/utils"

interface AddCompromisoData {
  concepto: string
  monto: number
  categoria: Categoria
  fecha_vencimiento: string
  recurrente?: boolean
}

export function useCompromisos() {
  const { user } = useAuth()
  const [compromisos, setCompromisos] = useState<Compromiso[]>([])
  const [loading, setLoading] = useState(true)
  const chanId = useId()

  const fetchCompromisos = useCallback(async () => {
    if (!supabase || !user?.id) return
    const { data, error } = await supabase
      .from("compromisos")
      .select("*")
      .eq("user_id", user.id)
      .eq("pagado", false)
      .order("fecha_vencimiento", { ascending: true })
    if (!error && data) setCompromisos(data as Compromiso[])
    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    if (!supabase || !user?.id) {
      setLoading(false)
      return
    }
    fetchCompromisos()

    const channel = supabase
      .channel(`compromisos-realtime-${chanId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "compromisos" },
        () => fetchCompromisos(),
      )
      .subscribe()

    return () => { supabase?.removeChannel(channel) }
  }, [fetchCompromisos])

  const addCompromiso = async (data: AddCompromisoData) => {
    if (!supabase || !user?.id) return
    await supabase.from("compromisos").insert({
      user_id: user.id,
      concepto: data.concepto,
      monto: data.monto,
      categoria: data.categoria,
      fecha_vencimiento: data.fecha_vencimiento,
      recurrente: data.recurrente ?? false,
    })
  }

  const marcarPagado = async (compromiso: Compromiso) => {
    if (!supabase || !user?.id) return

    const { data: gasto, error } = await supabase
      .from("gastos")
      .insert({
        user_id: user.id,
        monto: compromiso.monto,
        concepto: compromiso.concepto,
        categoria: compromiso.categoria,
        fecha: new Date(compromiso.fecha_vencimiento + "T12:00:00").toISOString(),
      })
      .select("id")
      .single()

    if (error || !gasto) return

    await supabase
      .from("compromisos")
      .update({ pagado: true, gasto_id: gasto.id })
      .eq("id", compromiso.id)

    if (compromiso.recurrente) {
      const fecha = parseDateSafe(compromiso.fecha_vencimiento)
      const proxMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate())
      const proxStr = `${proxMes.getFullYear()}-${String(proxMes.getMonth() + 1).padStart(2, "0")}-${String(proxMes.getDate()).padStart(2, "0")}`

      const { data: existente } = await supabase
        .from("compromisos")
        .select("id")
        .eq("user_id", user.id)
        .eq("concepto", compromiso.concepto)
        .eq("monto", compromiso.monto)
        .eq("pagado", false)
        .gte("fecha_vencimiento", proxStr)
        .limit(1)

      if (!existente || existente.length === 0) {
        await supabase.from("compromisos").insert({
          user_id: user.id,
          concepto: compromiso.concepto,
          monto: compromiso.monto,
          categoria: compromiso.categoria,
          fecha_vencimiento: proxStr,
          recurrente: true,
        })
      }
    }
  }

  const deleteCompromiso = async (id: string) => {
    if (!supabase) return
    await supabase.from("compromisos").delete().eq("id", id)
  }

  return {
    compromisos,
    loading,
    refetch: fetchCompromisos,
    addCompromiso,
    marcarPagado,
    deleteCompromiso,
  }
}
