import { useState, type FormEvent } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"
import { useCategorias } from "@/hooks/useCategorias"
import type { Categoria } from "@/types"

interface AddExpenseDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved?: () => void
}

export function AddExpenseDialog({ open: controlledOpen, onOpenChange, onSaved }: AddExpenseDialogProps) {
  const { user } = useAuth()
  const { categoriasGasto } = useCategorias()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [loading, setLoading] = useState(false)
  const [monto, setMonto] = useState("")
  const [concepto, setConcepto] = useState("")
  const [categoria, setCategoria] = useState<Categoria>("Otros")
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0])
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMsg("")

    if (!supabase) { setErrorMsg("Supabase no está configurado"); return }
    if (!user) { setErrorMsg("Debes iniciar sesión"); return }
    if (!monto || parseInt(monto, 10) <= 0) { setErrorMsg("Ingresa un monto válido"); return }
    if (!concepto.trim()) { setErrorMsg("Ingresa un concepto"); return }

    const montoNum = parseInt(monto, 10)
    if (isNaN(montoNum) || montoNum <= 0) { setErrorMsg("Monto inválido"); return }

    setLoading(true)
    const { error } = await supabase.from("gastos").insert({
      monto: montoNum,
      concepto: concepto.trim(),
      categoria,
      fecha: new Date(fecha).toISOString(),
      user_id: user.id,
    })

    setLoading(false)
    if (error) {
      setErrorMsg(error.message)
      return
    }

    setMonto("")
    setConcepto("")
    setCategoria("Otros")
    setFecha(new Date().toISOString().split("T")[0])
    onSaved?.()
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) setErrorMsg("")
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-red-500/20 text-red-300 hover:bg-red-500/30 font-medium">
          <Plus className="mr-1 h-4 w-4" />
          Gasto
        </Button>
      </DialogTrigger>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Nuevo gasto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{errorMsg}</p>
          )}
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
              placeholder="5000"
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
              placeholder="Almuerzo"
              className="mt-1 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label htmlFor="categoria" className="text-sm font-medium text-zinc-300">Categoría</label>
            <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)}>
              <SelectTrigger className="mt-1 w-full border-zinc-700 bg-zinc-800/50 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
                {categoriasGasto.map((cat) => (
                  <SelectItem key={cat.nombre} value={cat.nombre} className="focus:bg-zinc-800 focus:text-zinc-100">{cat.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
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
