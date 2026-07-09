import { useState, useMemo, useCallback } from "react"
import { Trash, X, CaretLeft, CaretRight, CaretDown, CaretUp, Download, MagnifyingGlass, ArrowClockwise, PencilSimple, Check } from "@phosphor-icons/react"
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
  const [busqueda, setBusqueda] = useState("")
  const [montoMin, setMontoMin] = useState("")
  const [montoMax, setMontoMax] = useState("")
  const [pagina, setPagina] = useState(1)
  const POR_PAGINA = 10

  const [editingCategoria, setEditingCategoria] = useState<string | null>(null)
  const [savingCat, setSavingCat] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editConcepto, setEditConcepto] = useState("")
  const [editMonto, setEditMonto] = useState("")
  const [editFecha, setEditFecha] = useState("")
  const [editTags, setEditTags] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [sortColumn, setSortColumn] = useState<"fecha" | "concepto" | "categoria" | "monto">("fecha")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  const toggleSort = (col: typeof sortColumn) => {
    if (sortColumn === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortColumn(col)
      setSortDir(col === "fecha" ? "desc" : "asc")
    }
  }

  const SortIcon = ({ col }: { col: typeof sortColumn }) => {
    if (sortColumn !== col) return null
    return sortDir === "asc" ? <CaretUp className="inline-block h-3 w-3" weight="bold" /> : <CaretDown className="inline-block h-3 w-3" weight="bold" />
  }

  const startEdit = (ingreso: Ingreso) => {
    setEditingId(ingreso.id)
    setEditConcepto(ingreso.concepto ?? "")
    setEditMonto(String(ingreso.monto))
    setEditFecha(ingreso.fecha.slice(0, 10))
    setEditTags(ingreso.tags?.join(", ") ?? "")
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  const handleEditSave = async (id: string) => {
    if (!supabase) return
    setSavingEdit(true)
    const tags = editTags.split(",").map(t => t.trim()).filter(Boolean)
    await supabase.from("ingresos").update({
      concepto: editConcepto,
      monto: Number(editMonto),
      fecha: new Date(editFecha).toISOString(),
      tags,
    }).eq("id", id)
    setSavingEdit(false)
    setEditingId(null)
  }

  const hayFiltros = filtroCategoria !== "todas" || fechaDesde || fechaHasta || busqueda || montoMin || montoMax

const filtrados = useMemo(() => {
      setPagina(1)
      let items = ingresos

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
    }, [ingresos, filtroCategoria, busqueda, fechaDesde, fechaHasta, montoMin, montoMax])

    const sorted = useMemo(() => {
      const items = [...filtrados]
      items.sort((a, b) => {
        let cmp = 0
        if (sortColumn === "monto") cmp = a.monto - b.monto
        else if (sortColumn === "fecha") cmp = a.fecha.localeCompare(b.fecha)
        else if (sortColumn === "concepto") cmp = (a.concepto ?? "").localeCompare(b.concepto ?? "")
        else if (sortColumn === "categoria") cmp = a.categoria.localeCompare(b.categoria)
        return sortDir === "asc" ? cmp : -cmp
      })
      return items
    }, [filtrados, sortColumn, sortDir])

    const totalPaginas = Math.max(1, Math.ceil(sorted.length / POR_PAGINA))
    const paginaActual = Math.min(pagina, totalPaginas)
    const inicio = (paginaActual - 1) * POR_PAGINA
    const paginados = sorted.slice(inicio, inicio + POR_PAGINA)

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
      const rows = sorted.map((g) => [g.fecha, g.concepto ?? "", g.categoria, g.monto])
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `ingresos-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }, [sorted])

  const handleDelete = async (id: string) => {
    if (!supabase) return
    setDeleting(id)
    await supabase.from("ingresos").delete().eq("id", id)
    setDeleting(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" weight="bold" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar..."
            className="h-8 w-[160px] rounded-md border border-border bg-card pl-7 pr-2 text-xs text-card-foreground placeholder:text-muted-foreground"
          />
        </div>

        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="h-8 w-[130px] border-border bg-card text-xs text-card-foreground">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent className="border-border bg-card text-card-foreground">
            <SelectItem value="todas" className="text-xs focus:bg-accent focus:text-accent-foreground">Todas</SelectItem>
            {categoriasList.map((cat) => (
              <SelectItem key={cat.nombre} value={cat.nombre} className="text-xs focus:bg-accent focus:text-accent-foreground">
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <input
          type="date"
          value={fechaDesde}
          onChange={(e) => setFechaDesde(e.target.value)}
          className="h-8 w-[130px] rounded-md border border-border bg-card px-2 text-xs text-card-foreground [color-scheme:var(--color-scheme)]"
          title="Desde"
        />
        <input
          type="date"
          value={fechaHasta}
          onChange={(e) => setFechaHasta(e.target.value)}
          className="h-8 w-[130px] rounded-md border border-border bg-card px-2 text-xs text-card-foreground [color-scheme:var(--color-scheme)]"
          title="Hasta"
        />

        <input
          type="number"
          value={montoMin}
          onChange={(e) => setMontoMin(e.target.value)}
          placeholder="Monto min"
          className="h-8 w-[100px] rounded-md border border-border bg-card px-2 text-xs text-card-foreground placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />
        <input
          type="number"
          value={montoMax}
          onChange={(e) => setMontoMax(e.target.value)}
          placeholder="Monto max"
          className="h-8 w-[100px] rounded-md border border-border bg-card px-2 text-xs text-card-foreground placeholder:text-muted-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        />

        <div className="flex items-center gap-1">
          {hayFiltros && (
            <Button
              variant="ghost"
              size="sm"
              onClick={limpiarFiltros}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-accent-foreground"
            >
              <X className="h-3 w-3" weight="bold" />
              Limpiar
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={exportarCSV}
            className="h-8 border-border text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title="Exportar CSV"
          >
            <Download className="h-3 w-3" weight="bold" />
            CSV
          </Button>
        </div>
      </div>

      {filtrados.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {hayFiltros ? "Sin resultados con los filtros actuales" : "No hay ingresos registrados"}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
<thead>
               <tr className="border-b border-border">
                 <th className="cursor-pointer pb-2 pr-4 text-left text-xs font-medium text-muted-foreground hover:text-foreground select-none" onClick={() => toggleSort("fecha")}>Fecha <SortIcon col="fecha" /></th>
                 <th className="cursor-pointer pb-2 pr-4 text-left text-xs font-medium text-muted-foreground hover:text-foreground select-none" onClick={() => toggleSort("concepto")}>Concepto <SortIcon col="concepto" /></th>
                 <th className="cursor-pointer pb-2 pr-4 text-left text-xs font-medium text-muted-foreground hover:text-foreground select-none" onClick={() => toggleSort("categoria")}>Categoría <SortIcon col="categoria" /></th>
                 <th className="cursor-pointer pb-2 pl-4 text-right text-xs font-medium text-muted-foreground hover:text-foreground select-none" onClick={() => toggleSort("monto")}>Monto <SortIcon col="monto" /></th>
                 <th className="w-10 pb-2" />
               </tr>
             </thead>
            <tbody>
              {paginados.map((ingreso) => (
                <tr key={ingreso.id} className="border-b border-border last:border-0">
                  <td className="py-3 pr-4">
                    {editingId === ingreso.id ? (
                      <input
                        type="date"
                        value={editFecha}
                        onChange={(e) => setEditFecha(e.target.value)}
                        className="h-7 w-[130px] rounded-md border border-border bg-muted px-2 text-xs text-card-foreground [color-scheme:var(--color-scheme)]"
                      />
                    ) : (
                      <span className="text-muted-foreground">{formatDate(ingreso.fecha)}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {editingId === ingreso.id ? (
                      <div className="space-y-1">
                        <input
                          type="text"
                          value={editConcepto}
                          onChange={(e) => setEditConcepto(e.target.value)}
                          className="h-7 w-[160px] rounded-md border border-border bg-muted px-2 text-xs text-card-foreground"
                          placeholder="Concepto"
                        />
                        <input
                          type="text"
                          value={editTags}
                          onChange={(e) => setEditTags(e.target.value)}
                          className="h-7 w-[160px] rounded-md border border-border bg-muted px-2 text-xs text-card-foreground"
                          placeholder="Tags (coma separada)"
                        />
                      </div>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5 font-medium text-card-foreground">
                          {ingreso.recurrente && <ArrowClockwise className="h-3 w-3 text-yellow-400" weight="bold" />}
                          {ingreso.concepto}
                        </span>
                        {ingreso.tags && ingreso.tags.length > 0 && (
                          <div className="mt-0.5 flex flex-wrap gap-1">
                            {ingreso.tags.map((tag) => (
                              <span key={tag} className="rounded bg-muted px-1.5 py-[1px] text-[9px] text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    {editingCategoria === ingreso.id ? (
                      <div className="flex items-center gap-1">
                        <Select
                          value={ingreso.categoria}
                          onValueChange={async (nuevaCat) => {
                            setSavingCat(ingreso.id)
                            await supabase!.from("ingresos").update({ categoria: nuevaCat }).eq("id", ingreso.id)
                            setSavingCat(null)
                            setEditingCategoria(null)
                          }}
                        >
                          <SelectTrigger className="h-7 w-[140px] border-border bg-muted text-xs text-card-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="border-border bg-card text-card-foreground">
                            {categoriasList.map((cat) => (
                              <SelectItem key={cat.nombre} value={cat.nombre} className="text-xs focus:bg-accent focus:text-accent-foreground">
                                {cat.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          onClick={() => setEditingCategoria(null)}
                          className="rounded p-0.5 text-muted-foreground hover:text-card-foreground"
                        >
                          <X className="h-3 w-3" weight="bold" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingCategoria(ingreso.id)}
                        className="group relative"
                        title="Cambiar categoría"
                      >
                        <Badge
                          variant="outline"
                          className="border-0 pr-2 text-white transition-all group-hover:pr-7"
                          style={{ backgroundColor: savingCat === ingreso.id ? "#6B7280" : getColor(ingreso.categoria) }}
                        >
                          {savingCat === ingreso.id ? (
                            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                          ) : (
                            ingreso.categoria
                          )}
                        </Badge>
                        {savingCat !== ingreso.id && (
                          <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-white/60 opacity-0 transition-opacity group-hover:opacity-100">
                            <Check className="h-3 w-3" weight="bold" />
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="py-3 pl-4 text-right">
                    {editingId === ingreso.id ? (
                      <input
                        type="number"
                        value={editMonto}
                        onChange={(e) => setEditMonto(e.target.value)}
                        className="h-7 w-[100px] rounded-md border border-border bg-muted px-2 text-right text-xs text-card-foreground [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                        step="0.01"
                      />
                    ) : (
                      <span className="font-semibold text-emerald-400">+{formatCurrency(ingreso.monto)}</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      {editingId === ingreso.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-400 hover:text-emerald-300"
                            onClick={() => handleEditSave(ingreso.id)}
                            disabled={savingEdit}
                          >
                            {savingEdit ? (
                              <span className="h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-transparent" />
                            ) : (
                              <Check className="h-3.5 w-3.5" weight="bold" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-card-foreground"
                            onClick={cancelEdit}
                          >
                            <X className="h-3.5 w-3.5" weight="bold" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-blue-400"
                            onClick={() => startEdit(ingreso)}
                          >
                            <PencilSimple className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-red-400"
                            onClick={() => handleDelete(ingreso.id)}
                            disabled={deleting === ingreso.id}
                          >
                            {deleting === ingreso.id ? (
                              <span className="h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-transparent" />
                            ) : (
                              <Trash className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtrados.length > POR_PAGINA && (
            <div className="flex items-center justify-between border-t border-border pt-3">
              <p className="text-xs text-muted-foreground">
                Mostrando {inicio + 1}&ndash;{Math.min(inicio + POR_PAGINA, filtrados.length)} de {filtrados.length}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-accent-foreground disabled:opacity-30"
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
                        ? "bg-zinc-800 text-foreground"
                        : "text-muted-foreground hover:text-accent-foreground"
                    }`}
                    onClick={() => setPagina(p)}
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-accent-foreground disabled:opacity-30"
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
