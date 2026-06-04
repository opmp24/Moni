import {
  ShoppingCart, ForkKnife, Car, House, Heart, GameController,
  Briefcase, Television, DeviceMobile, TShirt, Airplane,
  Coffee, BookOpen, CurrencyCircleDollar, CreditCard,
  PiggyBank, Money, Bank, Building, Basket, Bus, Train,
  GraduationCap, Tag, Bell,
} from "@phosphor-icons/react"

interface IconoEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<any>
  label: string
}

export const ICONOS_DISPONIBLES: Record<string, IconoEntry> = {
  ShoppingCart: { icon: ShoppingCart, label: "Compras" },
  ForkKnife: { icon: ForkKnife, label: "Comida" },
  Car: { icon: Car, label: "Auto" },
  House: { icon: House, label: "Casa" },
  Heart: { icon: Heart, label: "Salud" },
  GameController: { icon: GameController, label: "Juegos" },
  Briefcase: { icon: Briefcase, label: "Trabajo" },
  Television: { icon: Television, label: "TV/Stream" },
  DeviceMobile: { icon: DeviceMobile, label: "Celular" },
  TShirt: { icon: TShirt, label: "Ropa" },
  Airplane: { icon: Airplane, label: "Viajes" },
  Coffee: { icon: Coffee, label: "Café" },
  BookOpen: { icon: BookOpen, label: "Estudio" },
  CurrencyCircleDollar: { icon: CurrencyCircleDollar, label: "General" },
  CreditCard: { icon: CreditCard, label: "Tarjeta" },
  PiggyBank: { icon: PiggyBank, label: "Ahorro" },
  Money: { icon: Money, label: "Efectivo" },
  Bank: { icon: Bank, label: "Banco" },
  Building: { icon: Building, label: "Edificio" },
  Basket: { icon: Basket, label: "Supermercado" },
  Bus: { icon: Bus, label: "Bus" },
  Train: { icon: Train, label: "Tren" },
  GraduationCap: { icon: GraduationCap, label: "Educación" },
  Tag: { icon: Tag, label: "Etiqueta" },
  Bell: { icon: Bell, label: "Suscripción" },
}

export function getIconComponent(icono: string) {
  const entry = ICONOS_DISPONIBLES[icono]
  const comp = entry?.icon
  if (!comp) return CurrencyCircleDollar
  return comp
}

export const COLORES_DISPONIBLES = [
  "#FFD600",
  "#FF6B35",
  "#EF4444",
  "#EC4899",
  "#9B59B6",
  "#6366F1",
  "#3B82F6",
  "#06B6D4",
  "#22C55E",
  "#10B981",
  "#F59E0B",
  "#6B7280",
]
