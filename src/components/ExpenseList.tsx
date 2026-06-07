import { useState, useMemo, useCallback } from "react"
import { Trash, X, CaretLeft, CaretRight, Check, Download, MagnifyingGlass, ArrowClockwise } from "@phosphor-icons/react"
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
import type { Gasto } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"

interface ExpenseListProps {
  expenses: Gasto[]
}

export function ExpenseList({ expenses }: ExpenseListProps) {
  const { categoriasGasto, getColor } = useCategorias()
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingCategoria, setEditingCategoria] = useState<string | null>(null)
  const [savingCat, setSavingCat] = useState<string | null>(null)
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [montoMin, setMontoMin] = useState("")
  const [montoMax, setMontoMax] = useState("")
  const [pagina, setPagina] = useState(1)
  const POR_PAGINA = 10

  const hayFiltros = filtroCategoria !== "todas" || fechaDesde || fechaHasta || busqueda || montoMin || montoMax

  const filtrados = useMemo(() => {
    setPagina(1)
    let items = expenses

    if (filtroCategoria !== "todas") {
      items = items.filter((g) => g.categoria === filtroCategoria)
    }
    if (busqueda) {
      const q = busqueda.toLowerCase()
      items = items.filter((g) => g.concepto?.toLowerCase().includes(q))
    }
    if (fechaDesde) {
      items = items.filter((g) => g.fecha >= fechaDesde)
    }
    if (fechaHasta) {
      items = items.filter((g) => g.fecha <= fechaHasta + "T23:59:59")
    }
    if (montoMin) {
      items = items.filter((g) => Number(g.monto) >= Number(montoMin))
    }
    if (montoMax) {
      items = items.filter((g) => Number(g.monto) <= Number(montoMax))
    }
    return items
  }, [expenses, filtroCategoria, busqueda, fechaDesde, fechaHasta, montoMin, montoMax])

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio = (paginaActual - 1) * POR_PAGINA
  const paginados = filtrados.slice(inicio, inicio + POR_PAGINA)

  const limpiarFiltros = () => {
    setFiltroCategoria("todas")
    setFechaDesde("")
    setFechaHasta("")
    setBusqueda("")
    setMontoMin("")
    setMontoMax("")
    setPagina(1)
  }

  const exportarCSV = useCallback(() => {
    const headers = ["Fecha", "Concepto", "Categoría", "Monto"]
    const rows = filtrados.map((g) => [g.fecha, g.concepto ?? "", g.categoria, g.monto])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `gastos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filtrados])

  const handleDelete = async (id: string) => {
    if (!supabase) return
    setDeleting(id)
    await supabase.from("gastos").delete().eq("id", id)
    setDeleting(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-zinc-500" weight="bold" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar..."
            className="h-8 w-[160px] rounded-md border border-zinc-800 bg-zinc-900 pl-7 pr-2 text-xs text-zinc-300 placeholder:text-zinc-600"
          />
        </div>

        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="h-8 w-[130px] border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-300">
            <SelectItem value="todas" className="text-xs focus:bg-zinc-800 focus:text-zinc-100">Todas</SelectItem>
            {categoriasGasto.map((cat) => (
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
          className="h-8 w-[130px] rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-300 [color-scheme:dark]"
          title="Desde"
        />
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="h-8 w-[130px] rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-300 [color-scheme:dark]"
          title="Hasta"
        />

        <input
          type="number"
          value={montoMin}
          onChange={(e) => setMontoMin(e.target.value)}
          placeholder="Monto min"
          className="h-8 w-[100px] rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-300 placeholder:text-zinc-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <input
          type="number"
          value={montoMax}
          onChange={(e) => setMontoMax(e.target.value)}
          placeholder="Monto max"
          className="h-8 w-[100px] rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-300 placeholder:text-zinc-600 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />

        <div className="flex items-center gap-1">
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
          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="h-8 border-zinc-800 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            title="Exportar CSV"
          >
            <Download className="h-3 w-3" weight="bold" />
            CSV
          </Button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-600">
          {hayFiltros ? "Sin resultados con los filtros actuales" : "No hay gastos registrados"}
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
              {paginados.map((gasto) => (
                <tr key={gasto.id} className="border-b border-zinc-800/50 last:border-0">
                  <td className="py-3 pr-4 text-zinc-500">{formatDate(gasto.fecha)}</td>
                  <td className="py-3 pr-4 font-medium text-zinc-200">
                    <span className="flex items-center gap-1.5">
                      {gasto.recurrente && <ArrowClockwise className="h-3 w-3 text-yellow-400" weight="bold" />}
                      {gasto.concepto}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    {editingCategoria === gasto.id ? (
                      <div className="flex items-center gap-1">
                        <Select
                          value={gasto.categoria}
                          onValueChange={async (nuevaCat) => {
                            setSavingCat(gasto.id)
                            await supabase!.from("gastos").update({ categoria: nuevaCat }).eq("id", gasto.id)
                            setSavingCat(null)
                            setEditingCategoria(null)
                          }}
                        >
                          <SelectTrigger className="h-7 w-[140px] border-zinc-700 bg-zinc-800 text-xs text-zinc-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-zinc-700 bg-zinc-900 text-zinc-200">
                            {categoriasGasto.map((cat) => (
                              <SelectItem key={cat.nombre} value={cat.nombre} className="text-xs focus:bg-zinc-800 focus:text-zinc-100">
                                {cat.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => setEditingCategoria(null)}
                          className="rounded p-0.5 text-zinc-500 hover:text-zinc-300"
                        >
                          <X className="h-3 w-3" weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingCategoria(gasto.id)}
                        className="group relative"
                        title="Cambiar categoría"
                      >
                        <Badge
                          variant="outline"
                          className="border-0 pr-2 text-white transition-all group-hover:pr-7"
                          style={{ backgroundColor: savingCat === gasto.id ? "#6B7280" : getColor(gasto.categoria) }}
                        >
                          {savingCat === gasto.id ? (
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                          ) : (
                            gasto.categoria
                          )}
                        </Badge>
                        {savingCat !== gasto.id && (
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-white/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <Check className="h-3 w-3" weight="bold" />
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="py-3 pl-4 text-right font-semibold text-zinc-100">
                    {formatCurrency(gasto.monto)}
                  </td>
                  <td className="py-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-600 hover:text-red-400"
                      onClick={() => handleDelete(gasto.id)}
                      disabled={deleting === gasto.id}
                    >
                      {deleting === gasto.id ? (
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
