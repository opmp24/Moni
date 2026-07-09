import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  let d: Date
  if (typeof date === "string") {
    const datePart = date.slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [y, m, day] = datePart.split("-").map(Number)
      d = new Date(y, m - 1, day)
    } else {
      d = new Date(date)
    }
  } else {
    d = new Date(date)
  }
  if (isNaN(d.getTime())) throw new Error("Invalid date")
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d)
}

export function parseDateSafe(dateStr: string): Date {
  const datePart = dateStr.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [y, m, day] = datePart.split("-").map(Number)
    return new Date(y, m - 1, day)
  }
  return new Date(dateStr)
}
