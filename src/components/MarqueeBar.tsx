import type { Gasto } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface MarqueeBarProps {
  gastos: Gasto[]
}

export function MarqueeBar({ gastos }: MarqueeBarProps) {
  const ultimo = gastos[0]

  if (!ultimo) return null

  return (
    <div className="relative flex h-8 items-center overflow-hidden rounded-lg border border-border bg-card px-0">
      <div className="flex shrink-0 items-center gap-2 border-r border-border px-3 text-[11px] font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        En vivo
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="marquee-track whitespace-nowrap px-4 text-[11px] text-muted-foreground">
          {ultimo.concepto} — {formatCurrency(ultimo.monto)} en {ultimo.categoria}
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .marquee-track {
          animation: marquee 20s linear infinite;
          width: fit-content;
        }
      `}</style>
    </div>
  )
}
