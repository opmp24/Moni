import { useState } from "react"
import { Coins, Tag, SignOut, ArrowDownRight, ArrowUpRight } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface SettingsPopupProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onPresupuestos: () => void
  onCategorias: () => void
  onGasto: () => void
  onIngreso: () => void
  onCerrarSesion: () => void
}

export function SettingsPopup({
  open: controlledOpen,
  onOpenChange,
  onPresupuestos,
  onCategorias,
  onGasto,
  onIngreso,
  onCerrarSesion,
}: SettingsPopupProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  const closeAnd = (fn: () => void) => () => {
    setOpen(false)
    setTimeout(fn, 150)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-zinc-100">Configuración</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <SettingsButton
            icon={Coins}
            label="Presupuesto"
            onClick={closeAnd(onPresupuestos)}
          />
          <SettingsButton
            icon={Tag}
            label="Categorías"
            onClick={closeAnd(onCategorias)}
          />
          <SettingsButton
            icon={ArrowDownRight}
            label="Gasto"
            iconColor="text-red-400"
            onClick={closeAnd(onGasto)}
          />
          <SettingsButton
            icon={ArrowUpRight}
            label="Ingreso"
            iconColor="text-emerald-400"
            onClick={closeAnd(onIngreso)}
          />
        </div>
        <Button
          variant="outline"
          onClick={closeAnd(onCerrarSesion)}
          className="mt-2 border-zinc-800 text-red-400 hover:bg-red-950/50 hover:text-red-300"
        >
          <SignOut className="mr-2 h-4 w-4" weight="bold" />
          Cerrar sesión
        </Button>
      </DialogContent>
    </Dialog>
  )
}

function SettingsButton({
  icon: Icon,
  label,
  iconColor,
  onClick,
}: {
  icon: React.ComponentType<any>
  label: string
  iconColor?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:bg-zinc-800 hover:border-zinc-700"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 ${iconColor ?? "text-zinc-300"}`}>
        <Icon className="h-5 w-5" weight="bold" />
      </div>
      <span className="text-sm font-medium text-zinc-200">{label}</span>
    </button>
  )
}
