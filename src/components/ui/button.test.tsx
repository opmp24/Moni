import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { Button } from "./button"

describe("Button", () => {
  it("renderiza con texto", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument()
  })

  it("aplica variante default por defecto", () => {
    render(<Button>Default</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("bg-primary")
  })

  it("aplica variante destructive", () => {
    render(<Button variant="destructive">Delete</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("bg-destructive")
  })

  it("aplica variante outline", () => {
    render(<Button variant="outline">Outline</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("border-input")
  })

  it("aplica variante ghost", () => {
    render(<Button variant="ghost">Ghost</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("hover:bg-accent")
  })

  it("aplica variante link", () => {
    render(<Button variant="link">Link</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("underline-offset-4")
  })

  it("aplica size sm", () => {
    render(<Button size="sm">Small</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("h-8")
  })

  it("aplica size lg", () => {
    render(<Button size="lg">Large</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("h-10")
  })

  it("aplica size icon", () => {
    render(<Button size="icon">+</Button>)
    const btn = screen.getByRole("button")
    expect(btn.className).toContain("w-9")
  })

  it("está deshabilitado cuando disabled=true", () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("llama onClick al hacer clic", async () => {
    const fn = vi.fn()
    render(<Button onClick={fn}>Click</Button>)
    await userEvent.click(screen.getByRole("button"))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it("no llama onClick cuando está deshabilitado", async () => {
    const fn = vi.fn()
    render(<Button disabled onClick={fn}>No click</Button>)
    await userEvent.click(screen.getByRole("button"))
    expect(fn).not.toHaveBeenCalled()
  })

  it("acepta className adicional", () => {
    render(<Button className="extra-class">Styled</Button>)
    expect(screen.getByRole("button").className).toContain("extra-class")
  })

  it("renderiza como asChild con Slot", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    )
    const link = screen.getByRole("link", { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link.className).toContain("bg-primary")
  })
})
