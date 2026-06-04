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

export type Categoria =
  | "Alimentación"
  | "Transporte"
  | "Vivienda"
  | "Salud"
  | "Entretenimiento"
  | "Ingresos"
  | "Otros"

export const CATEGORIAS: Categoria[] = [
  "Alimentación",
  "Transporte",
  "Vivienda",
  "Salud",
  "Entretenimiento",
  "Ingresos",
  "Otros",
]

export const CATEGORIA_COLORS: Record<Categoria, string> = {
  Alimentación: "#FFD600",
  Transporte: "#FF6B35",
  Vivienda: "#004E98",
  Salud: "#3EB489",
  Entretenimiento: "#9B59B6",
  Ingresos: "#22C55E",
  Otros: "#6B7280",
}

export interface DashboardKPIs {
  totalGastos: number
  totalIngresos: number
  balance: number
  topCategoria: { categoria: Categoria; monto: number } | null
  transaccionesMes: number
}
