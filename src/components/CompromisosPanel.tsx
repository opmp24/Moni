import { useState } from "react"
import { Plus, Trash, Check } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useCompromisos } from "@/hooks/useCompromisos"
import { useCategorias } from "@/hooks/useCategorias"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/DatePicker"
import { formatCurrency, parseDateSafe } from "@/lib/utils"
import type { Categoria } from "@/types"

export function CompromisosPanel() {
  const { compromisos, loading, addCompromiso, marcarPagado, deleteCompromiso, refetch } = useCompromisos()
  const { categoriasGasto, getColor } = useCategorias()
  const [open, setOpen] = useState(false)
  const [concepto, setConcepto] = useState("")
  const [monto, setMonto] = useState("")
  const [categoria, setCategoria] = useState<Categoria>("Otros")
  const [fecha, setFecha] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })
  const [recurrente, setRecurrente] = useState(false)
  const [pagando, setPagando] = useState<string | null>(null)

  const handleAdd = async () => {
    if (!concepto.trim() || !monto) return
    await addCompromiso({
      concepto: concepto.trim(),
      monto: parseInt(monto, 10),
      categoria,
      fecha_vencimiento: fecha,
      recurrente,
    })
    setConcepto("")
    setMonto("")
    setCategoria("Otros")
    setFecha(() => {
      const d = new Date()
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    })
    setRecurrente(false)
    setOpen(false)
    refetch()
  }

  const handlePagar = async (c: typeof compromisos[0]) => {
    setPagando(c.id)
    await marcarPagado(c)
    setPagando(null)
  }

  if (loading) return null

  const hoy = new Date()
  const vencidos = compromisos.filter((c) => parseDateSafe(c.fecha_vencimiento) < hoy)
  const proximos = compromisos.filter((c) => parseDateSafe(c.fecha_vencimiento) >= hoy)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Próximos pagos</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 border-border text-xs text-card-foreground hover:bg-accent">
              <Plus className="mr-1 h-3 w-3" weight="bold" />
              Nuevo compromiso
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nuevo compromiso</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <input
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                placeholder="Concepto"
                className="flex h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Monto"
                className="flex h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
              <div>
                <label className="text-sm font-medium text-card-foreground">Categoría</label>
                <Select value={categoria} onValueChange={(v) => setCategoria(v as Categoria)}>
                  <SelectTrigger className="mt-1 w-full border-border bg-muted text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-card text-foreground">
                    {categoriasGasto.filter((c) => c.nombre !== "Ingresos").map((cat) => (
                      <SelectItem key={cat.nombre} value={cat.nombre} className="focus:bg-accent focus:text-accent-foreground">
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground">Fecha de vencimiento</label>
                <DatePicker value={fecha} onChange={setFecha} className="mt-1 h-9 w-full" />
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
              <Button onClick={handleAdd} className="w-full bg-yellow-400 text-zinc-950 hover:bg-yellow-300">
                Crear compromiso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {compromisos.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          No hay compromisos pendientes
        </p>
      ) : (
        <div className="space-y-2">
          {vencidos.length > 0 && (
            <>
              <p className="text-xs font-medium text-red-400">Vencidos</p>
              {vencidos.map((c) => (
                <CompromisoRow key={c.id} compromiso={c} getColor={getColor} onPagar={handlePagar} onDelete={deleteCompromiso} pagando={pagando === c.id} />
              ))}
            </>
          )}
          {proximos.map((c) => (
            <CompromisoRow key={c.id} compromiso={c} getColor={getColor} onPagar={handlePagar} onDelete={deleteCompromiso} pagando={pagando === c.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function CompromisoRow({
  compromiso,
  getColor,
  onPagar,
  onDelete,
  pagando,
}: {
  compromiso: { id: string; concepto: string; monto: number; categoria: string; fecha_vencimiento: string; recurrente: boolean }
  getColor: (cat: string) => string
  onPagar: (c: any) => void
  onDelete: (id: string) => void
  pagando: boolean
}) {
  const fecha = parseDateSafe(compromiso.fecha_vencimiento)
  const hoy = new Date()
  const diffDays = Math.ceil((fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  const vencido = fecha < hoy

  return (
    <div className={`flex items-center justify-between gap-2 rounded-lg border px-4 py-3 ${vencido ? "border-red-500/30 bg-red-500/5" : "border-border bg-card"}`}>
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${vencido ? "bg-red-500/20 text-red-400" : "bg-muted text-muted-foreground"}`}
        >
          {diffDays <= 0 ? "!" : diffDays}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-card-foreground truncate">
            {compromiso.concepto}
            {compromiso.recurrente && (
              <span className="ml-1.5 inline-block rounded bg-yellow-400/10 px-1 py-[1px] text-[9px] text-yellow-400">Mensual</span>
            )}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span
              className="inline-block h-2 w-2 rounded-full shrink-0"
              style={{ backgroundColor: getColor(compromiso.categoria) }}
            />
            <span>{compromiso.categoria}</span>
            <span>•</span>
            <span>{fecha.toLocaleDateString("es-CL", { day: "numeric", month: "short" })}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold text-foreground">{formatCurrency(compromiso.monto)}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-emerald-400 hover:text-emerald-300"
          onClick={() => onPagar(compromiso)}
          disabled={pagando}
        >
          {pagando ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-emerald-400 border-t-transparent" />
          ) : (
            <Check className="h-3.5 w-3.5" weight="bold" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-red-400"
          onClick={() => onDelete(compromiso.id)}
        >
          <Trash className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
