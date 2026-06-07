import { useState } from "react"
import { Coins, Tag, SignOut, ArrowDownRight, ArrowUpRight, Sun, Moon, Desktop } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useTheme } from "@/lib/theme"

interface SettingsPopupProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onPresupuestos: () => void
  onCategorias: () => void
  onGasto: () => void
  onIngreso: () => void
  onCerrarSesion: () => void
}

const TEMAS = [
  { value: "light" as const, icon: Sun, label: "Claro" },
  { value: "dark" as const, icon: Moon, label: "Oscuro" },
  { value: "system" as const, icon: Desktop, label: "Sistema" },
]

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
  const { theme, setTheme } = useTheme()

  const closeAnd = (fn: () => void) => () => {
    setOpen(false)
    setTimeout(fn, 150)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="border-border bg-background text-foreground sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Configuración</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Tema</p>
          <div className="flex gap-2">
            {TEMAS.map((t) => {
              const active = theme === t.value
              const Icon = t.icon
              return (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors ${
                    active
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-border hover:bg-accent"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-primary" : ""}`} weight={active ? "fill" : "bold"} />
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              )
            })}
          </div>
        </div>

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
            iconColor="text-destructive"
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
          className="mt-2 border-border text-destructive hover:bg-destructive/10 hover:text-destructive"
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
      className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-accent hover:border-border"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-muted ${iconColor ?? "text-muted-foreground"}`}>
        <Icon className="h-5 w-5" weight="bold" />
      </div>
      <span className="text-sm font-medium text-card-foreground">{label}</span>
    </button>
  )
}
