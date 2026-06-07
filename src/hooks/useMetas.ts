import { useState, useEffect, useCallback, useId } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import type { Meta } from "@/types"

export function useMetas() {
  const { user } = useAuth()
  const [metas, setMetas] = useState<Meta[]>([])
  const [loading, setLoading] = useState(true)
  const chanId = useId()

  const fetchMetas = useCallback(async () => {
    if (!supabase || !user) return
    const { data, error } = await supabase
      .from("metas")
      .select("*")
      .eq("user_id", user.id)
      .order("creada_en", { ascending: false })
    if (!error && data) setMetas(data as Meta[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!supabase || !user) {
      setLoading(false)
      return
    }
    fetchMetas()

    const channel = supabase
      .channel(`metas-realtime-${chanId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "metas" }, () => fetchMetas())
      .subscribe()

    return () => { supabase?.removeChannel(channel) }
  }, [fetchMetas, user])

  const addMeta = async (nombre: string, montoObjetivo: number, color: string, icono: string) => {
    if (!supabase || !user) return
    await supabase.from("metas").insert({
      user_id: user.id, nombre, monto_objetivo: montoObjetivo, color, icono,
    })
  }

  const updateMeta = async (id: string, updates: Partial<Meta>) => {
    if (!supabase) return
    await supabase.from("metas").update(updates).eq("id", id)
  }

  const deleteMeta = async (id: string) => {
    if (!supabase) return
    await supabase.from("metas").delete().eq("id", id)
  }

  return { metas, loading, refetch: fetchMetas, addMeta, updateMeta, deleteMeta }
}
