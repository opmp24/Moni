import { useState } from "react"
import { Check, Trash, Lock, Plus, CheckCircle } from "@phosphor-icons/react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCategorias } from "@/hooks/useCategorias"
import { getIconComponent, ICONOS_DISPONIBLES, COLORES_DISPONIBLES } from "@/lib/iconos"

interface CategoryEditorProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CategoryEditor({ open: controlledOpen, onOpenChange }: CategoryEditorProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const { categoriasList, addCategoria, updateCategoria, deleteCategoria, refetch } = useCategorias()

  const [showAddDialog, setShowAddDialog] = useState(false)

  const [nuevaNombre, setNuevaNombre] = useState("")
  const [nuevaColor, setNuevaColor] = useState(COLORES_DISPONIBLES[0])
  const [nuevaIcono, setNuevaIcono] = useState("CurrencyCircleDollar")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [deleteError, setDeleteError] = useState("")

  const resetForm = () => {
    setNuevaNombre("")
    setNuevaColor(COLORES_DISPONIBLES[0])
    setNuevaIcono("CurrencyCircleDollar")
    setError("")
  }

  const handleAdd = async () => {
    const nombre = nuevaNombre.trim()
    if (!nombre) { setError("Nombre requerido"); return }
    if (categoriasList.some((c) => c.nombre.toLowerCase() === nombre.toLowerCase())) {
      setError("Ya existe una categoría con ese nombre"); return
    }
    setSaving(true)
    setError("")
    try {
      await addCategoria(nombre, nuevaColor, nuevaIcono)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al agregar categoría")
      setSaving(false)
      return
    }
    setShowAddDialog(false)
    resetForm()
    setSaving(false)
    refetch()
  }

  const handleDelete = async (id: string) => {
    setDeleteError("")
    try {
      await deleteCategoria(id)
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "Error al eliminar")
    }
  }

  const handleChangeColor = async (id: string, color: string) => {
    await updateCategoria(id, { color })
  }

  const handleChangeIcono = async (id: string, icono: string) => {
    await updateCategoria(id, { icono })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Categorías</DialogTitle>
            <DialogDescription className="sr-only">
              Administra tus categorías de gastos
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-1 overflow-y-auto pr-1">
            {deleteError && (
              <div className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {deleteError}
              </div>
            )}
            {categoriasList.map((cat) => {
              const IconComp = getIconComponent(cat.icono)
              return (
                <div
                  key={`${cat.esDefault ? "def" : "cus"}-${cat.nombre}`}
                  className="flex items-center gap-3 rounded-lg border border-zinc-800 px-3 py-2.5"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IconComp className="h-4 w-4" weight="bold" />
                  </span>
                  <span className="flex-1 text-sm text-zinc-200">{cat.nombre}</span>
                  {cat.esDefault ? (
                    <Lock className="h-4 w-4 text-zinc-600" weight="bold" />
                  ) : (
                    <div className="flex items-center gap-1">
                      <ColorPicker
                        value={cat.color}
                        onChange={(color) => handleChangeColor(cat.id!, color)}
                        small
                      />
                      <IconPicker
                        value={cat.icono}
                        onChange={(icono) => handleChangeIcono(cat.id!, icono)}
                        small
                      />
                      <button
                        onClick={() => handleDelete(cat.id!)}
                        className="rounded p-1 text-zinc-600 hover:text-red-400"
                        title="Eliminar"
                      >
                        <Trash className="h-3.5 w-3.5" weight="bold" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <Button
            onClick={() => { setShowAddDialog(true); setError(""); setDeleteError("") }}
            variant="outline"
            className="border-dashed border-zinc-700 text-sm text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          >
            <Plus className="mr-1 h-4 w-4" weight="bold" />
            Agregar categoría
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={(v) => { setShowAddDialog(v); if (!v) resetForm() }}>
        <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Nueva categoría</DialogTitle>
            <DialogDescription className="sr-only">
              Crea una nueva categoría de gasto
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-400">Nombre</label>
              <input
                type="text"
                value={nuevaNombre}
                onChange={(e) => setNuevaNombre(e.target.value)}
                placeholder="Ej: Mascotas"
                className="mt-1 flex h-9 w-full rounded-md border border-zinc-700 bg-zinc-800/50 px-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Color</label>
              <ColorPicker value={nuevaColor} onChange={setNuevaColor} small={false} />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Icono</label>
              <IconPicker value={nuevaIcono} onChange={setNuevaIcono} small={false} />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowAddDialog(false); resetForm() }}
                className="h-8 border-zinc-700 text-xs text-zinc-400 hover:bg-zinc-800"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={saving}
                className="h-8 bg-yellow-500 text-xs text-zinc-950 hover:bg-yellow-400"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" weight="bold" />}
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ColorPicker({ value, onChange, small }: { value: string; onChange: (v: string) => void; small: boolean }) {
  const size = small ? "h-5 w-5" : "h-7 w-7"
  return (
    <div className="flex flex-nowrap gap-1 overflow-x-auto pb-1">
      {COLORES_DISPONIBLES.map((color) => (
        <button
          key={color}
          onClick={() => onChange(color)}
          className={`${size} rounded-full border-2 transition-all ${
            value === color ? "border-white scale-110" : "border-transparent"
          }`}
          style={{ backgroundColor: color }}
          title={color}
        >
          {value === color && <Check className="h-full w-full p-0.5 text-white" weight="bold" />}
        </button>
      ))}
    </div>
  )
}

function IconPicker({ value, onChange, small }: { value: string; onChange: (v: string) => void; small: boolean }) {
  const [open, setOpen] = useState(false)
  const size = small ? "h-6 w-6" : "h-8 w-8"
  const IconComp = getIconComponent(value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`${size} flex items-center justify-center rounded-md border border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700`}
        title="Cambiar icono"
      >
        <IconComp className={small ? "h-3.5 w-3.5" : "h-4 w-4"} weight="bold" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 grid max-h-48 w-64 grid-cols-6 gap-1 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-2 shadow-xl">
            {Object.entries(ICONOS_DISPONIBLES).map(([key, info]) => {
              const I = info.icon
              return (
                <button
                  key={key}
                  onClick={() => { onChange(key); setOpen(false) }}
                  className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
                    value === key ? "bg-zinc-700 ring-1 ring-yellow-400" : "hover:bg-zinc-800"
                  }`}
                  title={info.label}
                >
                  <I className="h-4 w-4 text-zinc-300" weight="bold" />
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
