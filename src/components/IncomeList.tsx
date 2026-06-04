import { useState, useMemo } from "react"
import { Trash, Funnel, X, CaretLeft, CaretRight } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { supabase } from "@/lib/supabase"
import { useCategorias } from "@/hooks/useCategorias"
import type { Ingreso } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"

interface IncomeListProps {
  ingresos: Ingreso[]
}

export function IncomeList({ ingresos }: IncomeListProps) {
  const { categoriasList, getColor } = useCategorias()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [pagina, setPagina] = useState(1)
  const POR_PAGINA = 10

  const hayFiltros = filtroCategoria !== "todas" || fechaDesde || fechaHasta

  const filtrados = useMemo(() => {
    setPagina(1)
    let items = ingresos

    if (filtroCategoria !== "todas") {
      items = items.filter((g) => g.categoria === filtroCategoria)
    }
    if (fechaDesde) {
      items = items.filter((g) => g.fecha >= fechaDesde)
    }
    if (fechaHasta) {
      items = items.filter((g) => g.fecha <= fechaHasta + "T23:59:59")
    }
    return items
  }, [ingresos, filtroCategoria, fechaDesde, fechaHasta])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const paginados = filtrados.slice(inicio, inicio + POR_PAGINA)

  const limpiarFiltros = () => {
    setFiltroCategoria("todas")
    setFechaDesde("")
    setFechaHasta("")
    setPagina(1)
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    setDeleting(id)
    await supabase.from("ingresos").delete().eq("id", id)
    setDeleting(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          <Funnel className="h-3 w-3" weight="bold" />
          <span>Filtrar:</span>
        </div>

        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="h-8 w-[140px] border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-300">
            <SelectItem value="todas" className="text-xs focus:bg-zinc-800 focus:text-zinc-100">Todas</SelectItem>
            {categoriasList.map((cat) => (
              <SelectItem key={cat.nombre} value={cat.nombre} className="text-xs focus:bg-zinc-800 focus:text-zinc-100">
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-300 [color-scheme:dark]"
          title="Desde"
        />
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="h-8 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-300 [color-scheme:dark]"
          title="Hasta"
        />

        {hayFiltros && (
          <Button
            variant="ghost"
            size="sm"
            onClick={limpiarFiltros}
            className="h-8 px-2 text-xs text-zinc-500 hover:text-zinc-200"
          >
            <X className="h-3 w-3" weight="bold" />
            Limpiar
          </Button>
        )}
      </div>

      {filtrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-600">
          {hayFiltros ? "Sin resultados con los filtros actuales" : "No hay ingresos registrados"}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="pb-2 pr-4 text-left text-xs font-medium text-zinc-500">Fecha</th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-zinc-500">Concepto</th>
                <th className="pb-2 pr-4 text-left text-xs font-medium text-zinc-500">Categoría</th>
                <th className="pb-2 pl-4 text-right text-xs font-medium text-zinc-500">Monto</th>
                <th className="w-10 pb-2" />
              </tr>
            </thead>
            <tbody>
              {paginados.map((ingreso) => (
                <tr key={ingreso.id} className="border-b border-zinc-800/50 last:border-0">
                  <td className="py-3 pr-4 text-zinc-500">{formatDate(ingreso.fecha)}</td>
                  <td className="py-3 pr-4 font-medium text-zinc-200">{ingreso.concepto}</td>
                  <td className="py-3 pr-4">
                    <Badge
                      variant="outline"
                      className="border-0 text-white"
                      style={{ backgroundColor: getColor(ingreso.categoria) }}
                    >
                      {ingreso.categoria}
                    </Badge>
                  </td>
                  <td className="py-3 pl-4 text-right font-semibold text-emerald-400">
                    +{formatCurrency(ingreso.monto)}
                  </td>
                  <td className="py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-600 hover:text-red-400"
                      onClick={() => handleDelete(ingreso.id)}
                      disabled={deleting === ingreso.id}
                    >
                      {deleting === ingreso.id ? (
                        <span className="h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-transparent" />
                      ) : (
                        <Trash className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length > POR_PAGINA && (
            <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
              <p className="text-xs text-zinc-600">
                Mostrando {inicio + 1}&ndash;{Math.min(inicio + POR_PAGINA, filtrados.length)} de {filtrados.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
                  disabled={paginaActual <= 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  <CaretLeft className="h-3.5 w-3.5" weight="bold" />
                </Button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === paginaActual ? "secondary" : "ghost"}
                    size="sm"
                    className={`h-7 min-w-[28px] px-1 text-xs ${
                      p === paginaActual
                        ? "bg-zinc-800 text-zinc-100"
                        : "text-zinc-500 hover:text-zinc-200"
                    }`}
                    onClick={() => setPagina(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-zinc-500 hover:text-zinc-200 disabled:opacity-30"
                  disabled={paginaActual >= totalPaginas}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                >
                  <CaretRight className="h-3.5 w-3.5" weight="bold" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
