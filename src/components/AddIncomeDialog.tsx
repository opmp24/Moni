import { useState, type FormEvent } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth"

interface AddIncomeDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved?: () => void
}

export function AddIncomeDialog({ open: controlledOpen, onOpenChange, onSaved }: AddIncomeDialogProps) {
  const { user } = useAuth()
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen
  const [loading, setLoading] = useState(false)
  const [monto, setMonto] = useState("")
  const [concepto, setConcepto] = useState("")
  const [fecha, setFecha] = useState(() => new Date().toISOString().split("T")[0])
  const [recurrente, setRecurrente] = useState(false)
  const [tagsStr, setTagsStr] = useState("")
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
    const { error } = await supabase.from("ingresos").insert({
      monto: montoNum,
      concepto: concepto.trim(),
      categoria: "Ingresos",
      fecha: new Date(fecha).toISOString(),
      recurrente,
      periodo: recurrente ? "mensual" : null,
      tags: tagsStr ? tagsStr.split(",").map((t) => t.trim()).filter(Boolean) : [],
      user_id: user.id,
    })

    setLoading(false)
    if (error) {
      setErrorMsg(error.message)
      return
    }

    setMonto("")
    setConcepto("")
    setFecha(new Date().toISOString().split("T")[0])
    setRecurrente(false)
    setTagsStr("")
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
        <Button className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-medium">
          <Plus className="mr-1 h-4 w-4" />
          Ingreso
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle className="text-foreground">Nuevo ingreso</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">{errorMsg}</p>
          )}
          <div>
            <label htmlFor="monto" className="text-sm font-medium text-card-foreground">Monto</label>
            <input
              id="monto"
              type="number"
              inputMode="numeric"
              min={1}
              required
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="500000"
              className="mt-1 flex h-9 w-full rounded-md border border-border bg-muted px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label htmlFor="concepto" className="text-sm font-medium text-card-foreground">Concepto</label>
            <input
              id="concepto"
              type="text"
              required
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              placeholder="Sueldo junio"
              className="mt-1 flex h-9 w-full rounded-md border border-border bg-muted px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label htmlFor="fecha" className="text-sm font-medium text-card-foreground">Fecha</label>
            <input
              id="fecha"
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 flex h-9 w-full rounded-md border border-border bg-muted px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-card-foreground">Etiquetas</label>
            <input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="comida, trabajo, urgente"
              className="mt-1 flex h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={recurrente}
              onChange={(e) => setRecurrente(e.target.checked)}
              className="h-4 w-4 rounded border-border bg-muted text-yellow-400 focus:ring-yellow-400"
            />
            Repetir mensualmente
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} className="border-border text-card-foreground hover:bg-accent hover:text-accent-foreground">
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
