import { useState, useEffect } from "react"
import { PencilSimple, Check } from "@phosphor-icons/react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { CATEGORIA_COLORS, CATEGORIAS, type Categoria, type Presupuesto } from "@/types"

export function BudgetSettings() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const cargarPresupuestos = async () => {
    if (!supabase || !user) return
    setLoading(true)
    const ahora = new Date()
    const mesStart = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`
    const { data } = await supabase
      .from("presupuestos")
      .select("*")
      .eq("user_id", user.id)
      .eq("mes", mesStart)
    setPresupuestos(data as Presupuesto[] ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (open) cargarPresupuestos()
  }, [open])

  const obtenerMonto = (cat: string) => {
    const p = presupuestos.find((p) => p.categoria === cat)
    return p?.monto ?? 0
  }

  const handleChange = (categoria: string, value: string) => {
    const num = Number(value.replace(/\./g, ""))
    if (isNaN(num)) return

    setPresupuestos((prev) => {
      const idx = prev.findIndex((p) => p.categoria === categoria)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = { ...updated[idx], monto: num }
        return updated
      }
      const ahora = new Date()
      const mesStart = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`
      return [...prev, {
        id: "",
        user_id: user?.id ?? "",
        categoria: categoria as Categoria,
        mes: mesStart,
        monto: num,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }]
    })
  }

  const handleSave = async () => {
    if (!supabase || !user) return
    setSaving(true)

    const ahora = new Date()
    const mesStart = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-01`

    for (const p of presupuestos) {
      if (p.id) {
        await supabase
          .from("presupuestos")
          .update({ monto: p.monto, updated_at: new Date().toISOString() })
          .eq("id", p.id)
      } else {
        await supabase
          .from("presupuestos")
          .insert({ user_id: user.id, categoria: p.categoria, mes: mesStart, monto: p.monto })
      }
    }

    setSaving(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-600 hover:text-zinc-300"
          title="Configurar presupuestos"
        >
          <PencilSimple className="h-3.5 w-3.5" weight="bold" />
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Presupuestos mensuales</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          </div>
        ) : (
          <div className="space-y-3">
            {CATEGORIAS.filter((c) => c !== "Ingresos").map((cat) => (
              <div key={cat} className="flex items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORIA_COLORS[cat] }}
                />
                <label className="flex-1 text-sm text-zinc-300">{cat}</label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">$</span>
                  <input
                    type="text"
                    value={obtenerMonto(cat).toLocaleString("es-CL")}
                    onChange={(e) => handleChange(cat, e.target.value)}
                    className="h-9 w-36 rounded-md border border-zinc-800 bg-zinc-900 pl-6 pr-3 text-right text-sm text-zinc-200 [color-scheme:dark]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="mt-2 bg-yellow-500 text-zinc-950 hover:bg-yellow-400"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" weight="bold" />
          )}
          Guardar presupuestos
        </Button>
      </DialogContent>
    </Dialog>
  )
}
