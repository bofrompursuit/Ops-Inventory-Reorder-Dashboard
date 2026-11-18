import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAvatarGradient } from "@/lib/ops"
import type { StockState } from "@/lib/types"

const TONES = {
  neutral: { icon: "bg-muted text-foreground", value: "text-foreground" },
  green: {
    icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    value: "text-emerald-600 dark:text-emerald-400",
  },
  orange: {
    icon: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    value: "text-orange-600 dark:text-orange-400",
  },
  red: {
    icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    value: "text-rose-600 dark:text-rose-400",
  },
  violet: {
    icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    value: "text-foreground",
  },
} as const

export type Tone = keyof typeof TONES

export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      className={cn("rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-xs", className)}
      {...props}
    />
  )
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  valueTone,
}: {
  label: string
  value: string
  hint: React.ReactNode
  icon: LucideIcon
  tone?: Tone
  valueTone?: Tone
}) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground">
          {label}
        </p>
        <div className={cn("flex size-9 items-center justify-center rounded-lg", TONES[tone].icon)}>
          <Icon className="size-[18px]" />
        </div>
      </div>
      <p
        className={cn(
          "mt-1 text-4xl font-bold tracking-tight tabular-nums",
          TONES[valueTone ?? "neutral"].value
        )}
      >
        {value}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{hint}</p>
    </Panel>
  )
}

export function ProductAvatar({ sku, className }: { sku: string; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "size-8 shrink-0 rounded-lg bg-gradient-to-br opacity-90",
        getAvatarGradient(sku),
        className
      )}
    />
  )
}

const STOCK_STYLES: Record<StockState, { label: string; className: string }> = {
  "in-stock": {
    label: "In stock",
    className: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-400",
  },
  "low-stock": {
    label: "Low stock",
    className: "bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-400",
  },
  "out-of-stock": {
    label: "Out of stock",
    className: "bg-rose-600 text-white ring-rose-600",
  },
}

export function StockBadge({ state, label }: { state: StockState; label?: string }) {
  const style = STOCK_STYLES[state]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium whitespace-nowrap ring-1 ring-inset",
        style.className
      )}
    >
      {label ?? style.label}
    </span>
  )
}

export function ProgressBar({
  value,
  className,
  barClassName,
}: {
  value: number
  className?: string
  barClassName?: string
}) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className={cn("h-full rounded-full bg-foreground transition-[width]", barClassName)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  )
}

export function utilizationColor(percent: number) {
  if (percent >= 80) return "bg-orange-500"
  return "bg-foreground"
}
