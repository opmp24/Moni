import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MetasPanel } from "./MetasPanel"
import type { Meta } from "@/types"

const mockMetas: Meta[] = [
  {
    id: "1",
    nombre: "Vacaciones",
    monto_objetivo: 500000,
    monto_actual: 100000,
    color: "#FFD600",
    icono: "Coin",
    creada_en: new Date().toISOString(),
    completada: false,
  },
  {
    id: "2",
    nombre: "Laptop",
    monto_objetivo: 1000000,
    monto_actual: 1000000,
    color: "#22C55E",
    icono: "Coin",
    creada_en: new Date().toISOString(),
    completada: true,
  },
]

const mockAddMeta = vi.fn()
const mockUpdateMeta = vi.fn()
const mockDeleteMeta = vi.fn()
const mockRefetch = vi.fn()

vi.mock("@/hooks/useMetas", () => ({
  useMetas: () => ({
    metas: mockMetas,
    loading: false,
    addMeta: mockAddMeta,
    updateMeta: mockUpdateMeta,
    deleteMeta: mockDeleteMeta,
    refetch: mockRefetch,
  }),
}))

describe("MetasPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renderiza lista de metas", () => {
    render(<MetasPanel />)
    expect(screen.getByText("Vacaciones")).toBeInTheDocument()
    expect(screen.getByText("Laptop")).toBeInTheDocument()
  })

  it("muestra progreso correcto para meta completada", () => {
    render(<MetasPanel />)
    expect(screen.getByText("Completada ✓")).toBeInTheDocument()
  })

  it("muestra progreso parcial para meta en curso", () => {
    render(<MetasPanel />)
    expect(screen.getByText("20%")).toBeInTheDocument()
  })

  it("abre diálogo al hacer click en Nueva meta", async () => {
    const user = userEvent.setup()
    render(<MetasPanel />)
    await user.click(screen.getByText(/nueva meta/i))
    expect(screen.getByPlaceholderText("Nombre de la meta")).toBeInTheDocument()
  })

  it("crea meta al llenar el formulario", async () => {
    const user = userEvent.setup()
    render(<MetasPanel />)
    await user.click(screen.getByText(/nueva meta/i))
    await user.type(screen.getByPlaceholderText("Nombre de la meta"), "Fondo emergencia")
    await user.type(screen.getByPlaceholderText("Monto objetivo"), "300000")
    await user.click(screen.getByRole("button", { name: /crear meta/i }))
    expect(mockAddMeta).toHaveBeenCalledWith("Fondo emergencia", 300000, "#FFD600", "Coin")
  })

  it("llama refetch después de crear meta", async () => {
    const user = userEvent.setup()
    render(<MetasPanel />)
    await user.click(screen.getByText(/nueva meta/i))
    await user.type(screen.getByPlaceholderText("Nombre de la meta"), "Test")
    await user.type(screen.getByPlaceholderText("Monto objetivo"), "100000")
    await user.click(screen.getByRole("button", { name: /crear meta/i }))
    await waitFor(() => expect(mockRefetch).toHaveBeenCalled())
  })

  it("abre input de aporte al hacer click en Aportar", async () => {
    const user = userEvent.setup()
    render(<MetasPanel />)
    const aportarBtns = screen.getAllByText("Aportar")
    await user.click(aportarBtns[0])
    expect(screen.getByPlaceholderText("Monto")).toBeInTheDocument()
  })

  it("llama updateMeta al aportar", async () => {
    const user = userEvent.setup()
    const { container } = render(<MetasPanel />)
    const aportarBtns = screen.getAllByText("Aportar")
    await user.click(aportarBtns[0])
    await user.type(screen.getByPlaceholderText("Monto"), "50000")
    const arrowBtn = container.querySelector(".text-yellow-400")
    if (arrowBtn) await user.click(arrowBtn)
    await waitFor(() => {
      expect(mockUpdateMeta).toHaveBeenCalledWith("1", {
        monto_actual: 150000,
        completada: false,
      })
    })
  })

  it("llama refetch después de aportar", async () => {
    const user = userEvent.setup()
    const { container } = render(<MetasPanel />)
    const aportarBtns = screen.getAllByText("Aportar")
    await user.click(aportarBtns[0])
    // clear calls from handleAdd in "crear meta" flow (none in this test)
    mockRefetch.mockClear()
    await user.type(screen.getByPlaceholderText("Monto"), "50000")
    const arrowBtn = container.querySelector(".text-yellow-400")
    if (arrowBtn) await user.click(arrowBtn)
    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalledTimes(1)
    })
  })
})
