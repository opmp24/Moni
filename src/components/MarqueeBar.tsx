import type { Gasto } from "@/types"
import { formatCurrency } from "@/lib/utils"

interface MarqueeBarProps {
  gastos: Gasto[]
}

export function MarqueeBar({ gastos }: MarqueeBarProps) {
  const ultimos = gastos.slice(0, 10)

  if (ultimos.length === 0) return null

  return (
    <div className="relative flex h-8 items-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 px-0">
      <div className="flex shrink-0 items-center gap-2 border-r border-zinc-800 px-3 text-[11px] font-medium text-zinc-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        En vivo
      </div>
      <div className="relative flex-1 overflow-hidden">
        <div className="marquee-track flex gap-12 whitespace-nowrap px-4 text-[11px] text-zinc-400">
          <span>{renderItems(ultimos)}</span>
          <span>{renderItems(ultimos)}</span>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          animation: marquee 30s linear infinite;
          width: fit-content;
        }
      `}</style>
    </div>
  )
}

function renderItems(gastos: Gasto[]) {
  return gastos
    .map(
      (g) =>
        `${g.concepto} — ${formatCurrency(g.monto)} en ${g.categoria}  ●  `
    )
    .join("")
}
