import { AlertTriangleIcon, DollarSignIcon, PackageIcon } from "lucide-react"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber } from "@/lib/format"
import type { InventorySummary } from "@/lib/types"

export function MetricCards({ summary }: { summary: InventorySummary }) {
  const cards = [
    {
      label: "Total Inventory Value",
      value: formatCurrency(summary.totalInventoryValue),
      description: "Quantity on hand × unit price, across all SKUs",
      icon: DollarSignIcon,
    },
    {
      label: "Total SKUs",
      value: formatNumber(summary.totalSkus),
      description: "Unique items tracked in inventory",
      icon: PackageIcon,
    },
    {
      label: "Low-Stock Alerts",
      value: formatNumber(summary.lowStockCount),
      description: "Items at or below reorder threshold",
      icon: AlertTriangleIcon,
      alert: summary.lowStockCount > 0,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardDescription>{card.label}</CardDescription>
            <CardTitle
              className={cn(
                "text-2xl tabular-nums",
                card.alert && "text-amber-600 dark:text-amber-400"
              )}
            >
              {card.value}
            </CardTitle>
            <CardAction>
              <div
                className={cn(
                  "flex size-9 items-center justify-center rounded-full",
                  card.alert
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    : "bg-primary/10 text-primary"
                )}
              >
                <card.icon className="size-4.5" />
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
