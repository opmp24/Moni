import { useState, useEffect, useCallback, useId } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { CATEGORIAS_PREDEFINIDAS, CATEGORIA_COLORS, type CategoriaInfo } from "@/types"

interface CategoriaRow {
  id: string
  user_id: string
  nombre: string
  color: string
  icono: string
  created_at: string
}

export function useCategorias() {
  const { user } = useAuth()
  const [custom, setCustom] = useState<CategoriaRow[]>([])
  const [loading, setLoading] = useState(true)
  const channelId = useId()

  const fetchCategorias = useCallback(async () => {
    if (!supabase || !user) {
      setLoading(false)
      return
    }
    const { data } = await supabase
      .from("categorias")
      .select("*")
      .eq("user_id", user.id)
      .order("nombre")
    if (data) setCustom(data as CategoriaRow[])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!supabase || !user) {
      setLoading(false)
      return
    }

    fetchCategorias()

    const channel = supabase
      .channel(`categorias-realtime-${channelId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "categorias" },
        () => fetchCategorias(),
      )
      .subscribe()

    return () => { supabase?.removeChannel(channel) }
  }, [user, fetchCategorias, channelId])

  const categoriasList: CategoriaInfo[] = [
    ...CATEGORIAS_PREDEFINIDAS.map((nombre) => ({
      nombre,
      color: CATEGORIA_COLORS[nombre] ?? "#6B7280",
      icono: "CurrencyCircleDollar",
      esDefault: true,
    })),
    ...custom.map((c) => ({
      nombre: c.nombre,
      color: c.color,
      icono: c.icono,
      esDefault: false,
      id: c.id,
    })),
  ]

  const categoriasGasto = categoriasList.filter((c) => c.nombre !== "Ingresos")

  function getColor(nombre: string): string {
    return CATEGORIA_COLORS[nombre] ?? custom.find((c) => c.nombre === nombre)?.color ?? "#6B7280"
  }

  function getIcono(nombre: string): string {
    return custom.find((c) => c.nombre === nombre)?.icono ?? "CurrencyCircleDollar"
  }

  async function addCategoria(nombre: string, color: string, icono: string) {
    if (!supabase || !user) throw new Error("No hay sesión")
    const { error } = await supabase.from("categorias").insert({
      user_id: user.id,
      nombre,
      color,
      icono,
    })
    if (error) throw error
  }

  async function updateCategoria(id: string, data: { color?: string; icono?: string }) {
    if (!supabase) return
    await supabase.from("categorias").update(data).eq("id", id)
    await fetchCategorias()
  }

  async function deleteCategoria(id: string) {
    if (!supabase) return
    const cat = custom.find((c) => c.id === id)
    if (!cat) return

    const { count: gastosCount, error: gastosErr } = await supabase
      .from("gastos")
      .select("*", { count: "exact", head: true })
      .eq("categoria", cat.nombre)
    if (gastosErr) throw gastosErr

    if (gastosCount && gastosCount > 0) {
      throw new Error(
        `Hay ${gastosCount} gasto(s) con la categoría "${cat.nombre}". Elimínalos primero.`
      )
    }

    const { data: presupuesto } = await supabase
      .from("presupuestos")
      .select("id, monto")
      .eq("categoria", cat.nombre)
      .maybeSingle()

    if (presupuesto) {
      if (Number(presupuesto.monto) > 0) {
        throw new Error(
          `El presupuesto de "${cat.nombre}" es $${Number(presupuesto.monto).toLocaleString("es-CL")}. Ponlo en $0 primero.`
        )
      }
      await supabase.from("presupuestos").delete().eq("id", presupuesto.id)
    }

    await supabase.from("categorias").delete().eq("id", id)
    await fetchCategorias()
  }

  return {
    categoriasList,
    categoriasGasto,
    getColor,
    getIcono,
    addCategoria,
    updateCategoria,
    deleteCategoria,
    loading,
    refetch: fetchCategorias,
  }
}
