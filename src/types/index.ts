export type Categoria = string

export interface CategoriaInfo {
  nombre: string
  color: string
  icono: string
  esDefault: boolean
  id?: string
}

export const CATEGORIAS_PREDEFINIDAS = [
  "Alimentación",
  "Transporte",
  "Vivienda",
  "Salud",
  "Entretenimiento",
  "Ingresos",
  "Otros",
] as const

export const CATEGORIA_COLORS: Record<string, string> = {
  Alimentación: "#FFD600",
  Transporte: "#FF6B35",
  Vivienda: "#004E98",
  Salud: "#3EB489",
  Entretenimiento: "#9B59B6",
  Ingresos: "#22C55E",
  Otros: "#6B7280",
}

export interface Gasto {
  id: string
  monto: number
  concepto: string
  categoria: Categoria
  fecha: string
  telegram_chat_id?: string
  user_id?: string
  created_at: string
}

export interface Ingreso {
  id: string
  monto: number
  concepto: string
  categoria: Categoria
  fecha: string
  telegram_chat_id?: string
  user_id?: string
  created_at: string
}

export interface Presupuesto {
  id: string
  user_id: string
  categoria: Categoria
  mes: string
  monto: number
  created_at: string
  updated_at: string
}

export interface DashboardKPIs {
  totalGastos: number
  totalIngresos: number
  balance: number
  topCategoria: { categoria: Categoria; monto: number } | null
  transaccionesMes: number
}
