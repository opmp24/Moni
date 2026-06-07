import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Progress } from "./progress"

describe("Progress", () => {
  it("renderiza con valor por defecto", () => {
    const { container } = render(<Progress />)
    const root = container.firstChild as HTMLElement
    expect(root).toBeInTheDocument()
  })

  it("aplica value 0 correctamente", () => {
    const { container } = render(<Progress value={0} />)
    const indicator = container.querySelector("[style]")
    expect(indicator?.getAttribute("style")).toContain("translateX(-100%)")
  })

  it("aplica value 100 correctamente", () => {
    const { container } = render(<Progress value={100} />)
    const indicator = container.querySelector("[style]")
    expect(indicator?.getAttribute("style")).toContain("-0%")
  })

  it("aplica value 50 correctamente", () => {
    const { container } = render(<Progress value={50} />)
    const indicator = container.querySelector("[style]")
    expect(indicator?.getAttribute("style")).toContain("translateX(-50%)")
  })

  it("usa indicatorColor cuando se provee", () => {
    const { container } = render(<Progress value={50} indicatorColor="#FF0000" />)
    const indicator = container.querySelector("[style]")
    expect(indicator?.getAttribute("style")).toContain("rgb(255, 0, 0)")
  })

  it("aplica className adicional al root", () => {
    render(<Progress value={50} className="custom-progress" />)
    const root = screen.getByRole("progressbar")
    expect(root.className).toContain("custom-progress")
  })
})
