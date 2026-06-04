import { useState, type FormEvent } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"

export function AddIncomeDialog() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [monto, setMonto] = useState("")
  const [concepto, setConcepto] = useState("")
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabase || !user || !monto || !concepto) return

    setLoading(true)
    const { error } = await supabase.from("ingresos").insert({
      monto: parseInt(monto, 10),
      concepto: concepto.trim(),
      categoria: "Ingresos",
      fecha: new Date(fecha).toISOString(),
      user_id: user.id,
    })

    setLoading(false)
    if (error) {
      console.error("Error al guardar ingreso:", error)
      return
    }

    setMonto("")
    setConcepto("")
    setFecha(new Date().toISOString().split("T")[0])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-medium">
          <Plus className="mr-1 h-4 w-4" />
          Ingreso
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Nuevo ingreso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="monto" className="text-sm font-medium text-zinc-300">Monto</label>
            <input
              id="monto"
              type="number"
              inputMode="numeric"
              min={1}
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="500000"
              className="mt-1 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label htmlFor="concepto" className="text-sm font-medium text-zinc-300">Concepto</label>
            <input
              id="concepto"
              type="text"
              required
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Sueldo junio"
              className="mt-1 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label htmlFor="fecha" className="text-sm font-medium text-zinc-300">Fecha</label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="bg-yellow-400 text-zinc-950 hover:bg-yellow-300 font-medium">
              {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
