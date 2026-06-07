import { describe, it, expect } from "vitest"
import { getIconComponent, COLORES_DISPONIBLES, ICONOS_DISPONIBLES } from "./iconos"

describe("getIconComponent", () => {
  it("retorna icono válido para nombre conocido", () => {
    const Icon = getIconComponent("ShoppingCart")
    expect(Icon).toBeDefined()
  })

  it("retorna CurrencyCircleDollar como fallback para nombre inválido", () => {
    const Icon = getIconComponent("IconoInexistente123")
    const Fallback = getIconComponent("CurrencyCircleDollar")
    expect(Icon).toBe(Fallback)
  })

  it("retorna CurrencyCircleDollar para string vacío", () => {
    const Icon = getIconComponent("")
    const Fallback = getIconComponent("CurrencyCircleDollar")
    expect(Icon).toBe(Fallback)
  })

  it("retorna un componente para cada icono registrado", () => {
    const entries = Object.entries(ICONOS_DISPONIBLES)
    expect(entries.length).toBeGreaterThan(0)
    for (const [key] of entries) {
      const Icon = getIconComponent(key)
      expect(Icon).toBeDefined()
    }
  })
})

describe("COLORES_DISPONIBLES", () => {
  it("tiene exactamente 12 colores", () => {
    expect(COLORES_DISPONIBLES).toHaveLength(12)
  })

  it("todos los colores son hex válidos", () => {
    for (const color of COLORES_DISPONIBLES) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it("incluye amarillo (#FFD600) como primer color", () => {
    expect(COLORES_DISPONIBLES[0]).toBe("#FFD600")
  })

  it("no tiene duplicados", () => {
    const unicos = new Set(COLORES_DISPONIBLES)
    expect(unicos.size).toBe(COLORES_DISPONIBLES.length)
  })
})
