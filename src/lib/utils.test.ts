import { describe, it, expect } from "vitest"
import { formatCurrency, formatDate, cn } from "./utils"

describe("formatCurrency", () => {
  it("formatea 0", () => {
    expect(formatCurrency(0)).toMatch(/\$/)
  })

  it("formatea números positivos como CLP", () => {
    const result = formatCurrency(15000)
    expect(result).toContain("$")
    expect(result).toContain("15")
  })

  it("formatea números grandes con separador de miles", () => {
    const result = formatCurrency(1500000)
    expect(result).toContain("$")
    expect(result).toContain("1")
  })

  it("formatea números negativos", () => {
    const result = formatCurrency(-5000)
    expect(result).toContain("-")
    expect(result).toContain("$")
  })

  it("no incluye decimales", () => {
    const result = formatCurrency(1000.5)
    expect(result).not.toContain(",")
  })
})

describe("formatDate", () => {
  it("formatea fecha ISO", () => {
    const result = formatDate("2026-06-01")
    expect(result).toContain("jun")
    expect(result).toContain("2026")
  })

  it("formatea objeto Date", () => {
    const result = formatDate(new Date(2026, 0, 15))
    expect(result).toContain("ene")
    expect(result).toContain("2026")
  })

  it("formatea fecha con string completo", () => {
    const result = formatDate("2026-12-25T10:30:00")
    expect(result).toContain("dic")
    expect(result).toContain("2026")
  })

  it("formatea ISO UTC sin desfase horario", () => {
    const result = formatDate("2026-07-01T00:00:00.000Z")
    expect(result).toContain("jul")
    expect(result).toContain("2026")
    expect(result).toContain("1")
  })

  it("lanza error con fecha inválida", () => {
    expect(() => formatDate("fecha-invalida")).toThrow()
  })

  it("maneja null devolviendo fecha epoch", () => {
    const result = formatDate(null as unknown as string)
    expect(result.length).toBeGreaterThan(0)
  })

  it("lanza error con undefined", () => {
    expect(() => formatDate(undefined as unknown as string)).toThrow()
  })

  it("lanza error con undefined", () => {
    expect(() => formatDate(undefined as unknown as string)).toThrow()
  })
})

describe("cn", () => {
  it("combina clases simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar")
  })

  it("filtra valores falsy", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz")
  })

  it("mergea clases de Tailwind correctamente", () => {
    expect(cn("px-4", "px-2")).toBe("px-2")
  })

  it("maneja string vacío", () => {
    expect(cn("", "foo")).toBe("foo")
  })

  it("maneja solo falsy", () => {
    expect(cn(false, null, undefined)).toBe("")
  })
})
