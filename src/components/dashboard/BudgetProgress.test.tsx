import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { BudgetProgress } from "./BudgetProgress"

vi.mock("@/hooks/useCategorias", () => ({
  useCategorias: () => ({
    getColor: () => "#FFD600",
  }),
}))

describe("BudgetProgress", () => {
  it("muestra mensaje vacío cuando no hay datos", () => {
    render(<BudgetProgress data={[]} />)
    expect(screen.getByText(/sin presupuestos configurados/i)).toBeInTheDocument()
  })

  it("renderiza una categoría con datos", () => {
    const data = [{ categoria: "Alimentación", gastado: 50000, presupuesto: 200000 }]
    render(<BudgetProgress data={data} />)
    expect(screen.getByText("Alimentación")).toBeInTheDocument()
  })

  it("muestra montos formateados", () => {
    const data = [{ categoria: "Transporte", gastado: 30000, presupuesto: 100000 }]
    render(<BudgetProgress data={data} />)
    expect(screen.getByText(/30\.?000/)).toBeInTheDocument()
    expect(screen.getByText(/100\.?000/)).toBeInTheDocument()
  })

  it("muestra icono de advertencia al 80% o más", () => {
    const data = [{ categoria: "Alimentación", gastado: 160000, presupuesto: 200000 }]
    const { container } = render(<BudgetProgress data={data} />)
    const warningIcons = container.querySelectorAll("svg")
    expect(warningIcons.length).toBeGreaterThan(0)
  })

  it("muestra color rojo cuando excede el presupuesto", () => {
    const data = [{ categoria: "Alimentación", gastado: 250000, presupuesto: 200000 }]
    render(<BudgetProgress data={data} />)
    const montoEl = screen.getByText(/250\.?000/)
    expect(montoEl.className).toContain("destructive")
  })
})
