import { useState } from "react"
import { Plus, Trash, ArrowRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useMetas } from "@/hooks/useMetas"
import { COLORES_DISPONIBLES } from "@/lib/iconos"
import { formatCurrency } from "@/lib/utils"
import type { Meta } from "@/types"

export function MetasPanel() {
  const { metas, loading, addMeta, updateMeta, deleteMeta, refetch } = useMetas()
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState("")
  const [monto, setMonto] = useState("")
  const [color, setColor] = useState("#FFD600")
  const [aportar, setAportar] = useState<{ id: string; monto: string } | null>(null)

  const handleAdd = async () => {
    if (!nombre.trim() || !monto) return
    await addMeta(nombre.trim(), parseInt(monto, 10), color, "Coin")
    setNombre("")
    setMonto("")
    setColor("#FFD600")
    setOpen(false)
    refetch()
  }

  const handleAportar = async (meta: Meta) => {
    if (!aportar || !aportar.monto) return
    const nuevo = meta.monto_actual + parseInt(aportar.monto, 10)
    await updateMeta(meta.id, { monto_actual: nuevo, completada: nuevo >= meta.monto_objetivo })
    setAportar(null)
    refetch()
  }

  if (loading) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">Metas de ahorro</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 border-border text-xs text-card-foreground hover:bg-accent">
              <Plus className="mr-1 h-3 w-3" weight="bold" />
              Nueva meta
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card text-foreground sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-foreground">Nueva meta</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre de la meta"
                className="flex h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
              <input
                type="number"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                placeholder="Monto objetivo"
                className="flex h-9 w-full rounded-md border border-border bg-muted px-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
              <div className="flex flex-wrap gap-1.5">
                {COLORES_DISPONIBLES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-6 w-6 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <Button onClick={handleAdd} className="w-full bg-yellow-400 text-zinc-950 hover:bg-yellow-300">
                Crear meta
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {metas.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Crea tu primera meta de ahorro
        </p>
      ) : (
        <div className="space-y-3">
          {metas.map((meta) => {
            const pct = Math.min((meta.monto_actual / meta.monto_objetivo) * 100, 100)
            return (
              <div key={meta.id} className="rounded-lg border border-border bg-card px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="text-sm font-medium text-card-foreground">{meta.nombre}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {aportar?.id === meta.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={aportar.monto}
                          onChange={(e) => setAportar({ id: meta.id, monto: e.target.value })}
                          placeholder="Monto"
                          className="h-7 w-20 rounded border border-border bg-muted px-2 text-xs text-card-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                          autoFocus
                        />
                        <button
                          onClick={() => handleAportar(meta)}
                          className="rounded p-1 text-yellow-400 hover:text-yellow-300"
                        >
                          <ArrowRight className="h-3.5 w-3.5" weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAportar({ id: meta.id, monto: "" })}
                        className="rounded px-2 py-1 text-[10px] text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        Aportar
                      </button>
                    )}
                    <button
                      onClick={() => deleteMeta(meta.id)}
                      className="rounded p-1 text-muted-foreground hover:text-red-400"
                    >
                      <Trash className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={pct} indicatorColor={meta.completada ? "#22C55E" : meta.color} className="h-2" />
                </div>
                <div className="mt-1 flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">
                    {formatCurrency(meta.monto_actual)} / {formatCurrency(meta.monto_objetivo)}
                  </span>
                  <span className={meta.completada ? "text-emerald-400 font-medium" : "text-muted-foreground"}>
                    {meta.completada ? "Completada ✓" : `${pct.toFixed(0)}%`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
