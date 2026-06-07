import { render, screen } from "@testing-library/react"
import { describe, it, expect } from "vitest"
import { Badge } from "./badge"

describe("Badge", () => {
  it("renderiza con texto", () => {
    render(<Badge>Default</Badge>)
    expect(screen.getByText("Default")).toBeInTheDocument()
  })

  it("aplica variante default por defecto", () => {
    render(<Badge>Badge</Badge>)
    const badge = screen.getByText("Badge")
    expect(badge.className).toContain("bg-primary")
  })

  it("aplica variante secondary", () => {
    render(<Badge variant="secondary">Sec</Badge>)
    const badge = screen.getByText("Sec")
    expect(badge.className).toContain("bg-secondary")
  })

  it("aplica variante destructive", () => {
    render(<Badge variant="destructive">Danger</Badge>)
    const badge = screen.getByText("Danger")
    expect(badge.className).toContain("bg-destructive")
  })

  it("aplica variante outline", () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText("Outline")
    expect(badge.className).toContain("text-foreground")
  })

  it("acepta className adicional", () => {
    render(<Badge className="custom-class">Custom</Badge>)
    expect(screen.getByText("Custom").className).toContain("custom-class")
  })
})
