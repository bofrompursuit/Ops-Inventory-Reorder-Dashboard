"use client"

import Link from "next/link"
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  DollarSignIcon,
  MailIcon,
  PackageCheckIcon,
  PackageIcon,
  ReceiptIcon,
  SparklesIcon,
  TruckIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  KpiCard,
  Panel,
  PanelHeader,
  ProductAvatar,
  ProgressBar,
  StockBadge,
  utilizationColor,
} from "@/components/dashboard/primitives"
import { formatCurrency, formatNumber } from "@/lib/format"
import {
  countStockStates,
  formatCompactCurrency,
  formatMinutesAgo,
  getCategoryColor,
  getReorderSuggestions,
  summarizeCategories,
  summarizeSuppliers,
  summarizeWarehouses,
  type ActivityEntry,
  type ActivityKind,
} from "@/lib/ops"
import { cn } from "@/lib/utils"
import { getStockState, summarizeInventory, type InventoryItem } from "@/lib/types"

const ACTIVITY_STYLES: Record<ActivityKind, { icon: typeof TruckIcon; className: string }> = {
  shipment: { icon: TruckIcon, className: "bg-violet-500/10 text-violet-600 dark:text-violet-400" },
  alert: { icon: AlertTriangleIcon, className: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  restock: { icon: PackageCheckIcon, className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  reorder: { icon: MailIcon, className: "bg-muted text-foreground" },
}

export function Overview({
  items,
  activity,
  onGenerateEmail,
  onUpdateQuantity,
}: {
  items: InventoryItem[]
  activity: ActivityEntry[]
  onGenerateEmail: (items: InventoryItem[]) => void
  onUpdateQuantity: (item: InventoryItem) => void
}) {
  const summary = summarizeInventory(items)
  const states = countStockStates(items)
  const categories = summarizeCategories(items)
  const warehouses = summarizeWarehouses(items)
  const suggestions = getReorderSuggestions(items)
  const suppliers = summarizeSuppliers(suggestions)
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0)
  const reorderSpend = suggestions.reduce((sum, s) => sum + s.estimatedCost, 0)
  const topCategoryValue = categories[0]?.value ?? 0

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
      {/* Column 1 */}
      <div className="flex flex-col gap-5">
        <KpiCard
          label="Inventory value"
          value={formatCurrency(summary.totalInventoryValue)}
          hint={`${formatNumber(totalUnits)} units across ${warehouses.length} warehouses`}
          icon={DollarSignIcon}
          tone="green"
        />

        <Panel>
          <PanelHeader
            title="Low stock alerts"
            description={`${suggestions.length} items need attention`}
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/products?status=low-stock">
                  View all <ArrowRightIcon />
                </Link>
              </Button>
            }
          />
          {suggestions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Everything is above its reorder threshold.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {suggestions.slice(0, 7).map(({ item }) => {
                const state = getStockState(item)
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(item)}
                      className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-muted/50"
                    >
                      <ProductAvatar sku={item.sku} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.itemName}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                      <StockBadge
                        state={state}
                        label={state === "out-of-stock" ? undefined : `${item.quantity} left`}
                      />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>

        <KpiCard
          label="Reorder spend"
          value={formatCurrency(reorderSpend)}
          hint={`Suggested POs across ${suppliers.length} suppliers`}
          icon={ReceiptIcon}
        />
      </div>

      {/* Column 2 */}
      <div className="flex flex-col gap-5">
        <KpiCard
          label="Total SKUs"
          value={formatNumber(summary.totalSkus)}
          hint={`Across ${categories.length} categories`}
          icon={PackageIcon}
          tone="violet"
        />

        <Panel>
          <PanelHeader
            title="Reorder suggestions"
            description="Based on daily usage and supplier lead time"
            action={
              <Button
                size="sm"
                disabled={suggestions.length === 0}
                onClick={() => onGenerateEmail(suggestions.map((s) => s.item))}
              >
                <SparklesIcon />
                Draft POs
              </Button>
            }
          />
          <div className="-mx-1 flex flex-col">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-border px-1 pb-2 text-xs text-muted-foreground">
              <span>Item</span>
              <span className="text-right">Cover</span>
              <span className="w-16 text-right">Order</span>
            </div>
            {suggestions.slice(0, 6).map(({ item, daysOfCover, suggestedQuantity, estimatedCost }) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-border px-1 py-2.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.itemName}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.leadTimeDays ? `${item.leadTimeDays}-day lead time` : item.sku}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-right text-sm tabular-nums",
                    daysOfCover !== null && item.leadTimeDays && daysOfCover < item.leadTimeDays
                      ? "font-medium text-rose-600 dark:text-rose-400"
                      : "text-muted-foreground"
                  )}
                >
                  {daysOfCover === null ? "—" : `${daysOfCover.toFixed(daysOfCover < 10 ? 1 : 0)}d`}
                </span>
                <div className="w-16 text-right">
                  <p className="text-sm font-medium tabular-nums">+{formatNumber(suggestedQuantity)}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatCompactCurrency(estimatedCost)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Red cover means stock runs out before a new order can arrive.
          </p>
        </Panel>

        <Panel>
          <PanelHeader title="Warehouses" description="Storage capacity overview" />
          <div className="flex flex-col gap-5">
            {warehouses.map((warehouse) => (
              <div key={warehouse.name}>
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <p className="text-sm font-medium">{warehouse.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {warehouse.city} · {warehouse.skuCount} SKUs · {formatNumber(warehouse.units)} units
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      warehouse.utilization >= 80
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    )}
                  >
                    {warehouse.utilization}%
                  </span>
                </div>
                <ProgressBar
                  value={warehouse.utilization}
                  barClassName={utilizationColor(warehouse.utilization)}
                />
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Column 3 */}
      <div className="flex flex-col gap-5">
        <Panel>
          <PanelHeader title="Categories" description="Inventory value by category" />
          <div className="flex flex-col gap-3.5">
            {categories.map((category) => {
              const color = getCategoryColor(category.name)
              return (
                <div key={category.name}>
                  <div className="mb-1.5 flex items-center gap-2 text-sm">
                    <span className={cn("size-2.5 rounded-full", color.dot)} />
                    <span className="flex-1">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {category.count} items
                    </span>
                    <span className="w-14 text-right font-semibold tabular-nums">
                      {formatCompactCurrency(category.value)}
                    </span>
                  </div>
                  <ProgressBar
                    value={topCategoryValue ? (category.value / topCategoryValue) * 100 : 0}
                    barClassName={color.bar}
                  />
                </div>
              )
            })}
          </div>
        </Panel>

        <KpiCard
          label="Needs reorder"
          value={formatNumber(summary.lowStockCount)}
          hint={`${states["low-stock"]} low · ${states["out-of-stock"]} out of stock`}
          icon={AlertTriangleIcon}
          tone="orange"
          valueTone="orange"
        />

        <Panel>
          <PanelHeader title="Recent activity" description="Latest stock movements" />
          <ul className="flex flex-col gap-3.5">
            {activity.slice(0, 7).map((entry) => {
              const style = ACTIVITY_STYLES[entry.kind]
              return (
                <li key={entry.id} className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg",
                      style.className
                    )}
                  >
                    <style.icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{entry.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatMinutesAgo(entry.minutesAgo)}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </Panel>

        <Panel>
          <PanelHeader title="Suppliers to contact" description="Grouped suggested purchase orders" />
          <ul className="flex flex-col divide-y divide-border">
            {suppliers.map((supplier) => (
              <li key={supplier.email} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{supplier.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.skuCount} SKU{supplier.skuCount > 1 ? "s" : ""} · {formatCurrency(supplier.cost)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onGenerateEmail(
                      suggestions
                        .filter((s) => s.item.supplierEmail === supplier.email)
                        .map((s) => s.item)
                    )
                  }
                >
                  <MailIcon />
                  Email
                </Button>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}
