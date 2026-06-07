import { supabase } from "@/lib/supabase"

export async function duplicarRecurrentes(userId: string) {
  if (!supabase) return
  const ahora = new Date()
  const mesActual = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`

  for (const tabla of ["gastos", "ingresos"] as const) {
    const { data: items } = await supabase
      .from(tabla)
      .select("*")
      .eq("user_id", userId)
      .eq("recurrente", true)

    if (!items) continue

    for (const item of items) {
      const fechaItem = new Date(item.fecha)
      const mesItem = `${fechaItem.getFullYear()}-${String(fechaItem.getMonth() + 1).padStart(2, "0")}-01`

      if (mesItem >= mesActual) continue

      const { data: existente } = await supabase
        .from(tabla)
        .select("id")
        .eq("user_id", userId)
        .eq("concepto", item.concepto)
        .eq("monto", item.monto)
        .eq("categoria", item.categoria)
        .gte("fecha", mesActual)
        .limit(1)

      if (existente && existente.length > 0) continue

      const proxFecha = new Date(ahora.getFullYear(), ahora.getMonth(), fechaItem.getDate())
      if (proxFecha.getMonth() !== ahora.getMonth()) proxFecha.setDate(ahora.getDate())

      await supabase.from(tabla).insert({
        monto: item.monto,
        concepto: item.concepto,
        categoria: item.categoria,
        fecha: proxFecha.toISOString(),
        user_id: userId,
        recurrente: true,
        periodo: "mensual",
      })
    }
  }
}
