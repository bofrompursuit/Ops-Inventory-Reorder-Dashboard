import { getDaysOfCover, getRecommendedReorderQuantity } from "@/lib/email"
import {
  getInventoryStatus,
  getInventoryTotalValue,
  getStockState,
  type InventoryItem,
} from "@/lib/types"

// Reference data for the planned Snowflake WAREHOUSES / SUPPLIERS tables.
export const WAREHOUSES = [
  { name: "Brooklyn DC", city: "Brooklyn, NY", capacityUnits: 700 },
  { name: "Newark FC", city: "Newark, NJ", capacityUnits: 650 },
  { name: "Chicago Hub", city: "Chicago, IL", capacityUnits: 250 },
] as const

export const UNASSIGNED_WAREHOUSE = "Unassigned"
export const UNCATEGORIZED = "Uncategorized"

const SUPPLIER_NAMES: Record<string, string> = {
  "orders@packrightsupply.com": "PackRight Supply",
  "sales@cushionpro.com": "CushionPro",
  "b2b@safehandsupply.com": "SafeHand Supply",
  "orders@labelworksco.com": "LabelWorks Co.",
  "procurement@scandirect.com": "ScanDirect",
}

export function getSupplierName(email: string): string {
  return SUPPLIER_NAMES[email] ?? email.split("@")[1] ?? email
}

// Static class strings so Tailwind can see them at build time.
const CATEGORY_COLORS: Record<string, { dot: string; bar: string }> = {
  Packaging: { dot: "bg-blue-500", bar: "bg-blue-500" },
  Protective: { dot: "bg-emerald-500", bar: "bg-emerald-500" },
  "Tape & Adhesives": { dot: "bg-orange-500", bar: "bg-orange-500" },
  Labels: { dot: "bg-violet-500", bar: "bg-violet-500" },
  Safety: { dot: "bg-rose-500", bar: "bg-rose-500" },
  Equipment: { dot: "bg-cyan-600", bar: "bg-cyan-600" },
}

export function getCategoryColor(category: string) {
  return CATEGORY_COLORS[category] ?? { dot: "bg-zinc-400", bar: "bg-zinc-400" }
}

const AVATAR_GRADIENTS = [
  "from-blue-300 to-indigo-500",
  "from-emerald-300 to-green-500",
  "from-orange-200 to-amber-500",
  "from-violet-300 to-fuchsia-500",
  "from-rose-300 to-pink-500",
  "from-cyan-200 to-sky-500",
  "from-lime-200 to-emerald-400",
  "from-yellow-200 to-orange-400",
]

export function getAvatarGradient(sku: string): string {
  let hash = 0
  for (const char of sku) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length]
}

export function getItemCategory(item: InventoryItem) {
  return item.category || UNCATEGORIZED
}

export function getItemWarehouse(item: InventoryItem) {
  return item.warehouse || UNASSIGNED_WAREHOUSE
}

export function summarizeCategories(items: InventoryItem[]) {
  const groups = new Map<string, { name: string; count: number; value: number }>()
  for (const item of items) {
    const name = getItemCategory(item)
    const group = groups.get(name) ?? { name, count: 0, value: 0 }
    group.count += 1
    group.value += getInventoryTotalValue(item)
    groups.set(name, group)
  }
  return Array.from(groups.values()).sort((a, b) => b.value - a.value)
}

export function summarizeWarehouses(items: InventoryItem[]) {
  const known = WAREHOUSES.map((warehouse) => {
    const stocked = items.filter((item) => getItemWarehouse(item) === warehouse.name)
    const units = stocked.reduce((sum, item) => sum + item.quantity, 0)
    return {
      ...warehouse,
      skuCount: stocked.length,
      units,
      utilization: Math.min(100, Math.round((units / warehouse.capacityUnits) * 100)),
    }
  })
  return known.filter((warehouse) => warehouse.skuCount > 0)
}

export interface ReorderSuggestion {
  item: InventoryItem
  daysOfCover: number | null
  suggestedQuantity: number
  estimatedCost: number
}

// Items to reorder, most urgent first: out of stock, then fewest days of cover.
export function getReorderSuggestions(items: InventoryItem[]): ReorderSuggestion[] {
  return items
    .filter((item) => getInventoryStatus(item) === "low-stock")
    .map((item) => {
      const suggestedQuantity = getRecommendedReorderQuantity(item)
      return {
        item,
        daysOfCover: getDaysOfCover(item),
        suggestedQuantity,
        estimatedCost: suggestedQuantity * item.unitPrice,
      }
    })
    .sort((a, b) => {
      const aCover = a.daysOfCover ?? a.item.quantity
      const bCover = b.daysOfCover ?? b.item.quantity
      return aCover - bCover
    })
}

export function summarizeSuppliers(suggestions: ReorderSuggestion[]) {
  const groups = new Map<string, { email: string; name: string; skuCount: number; cost: number }>()
  for (const suggestion of suggestions) {
    const email = suggestion.item.supplierEmail
    const group = groups.get(email) ?? {
      email,
      name: getSupplierName(email),
      skuCount: 0,
      cost: 0,
    }
    group.skuCount += 1
    group.cost += suggestion.estimatedCost
    groups.set(email, group)
  }
  return Array.from(groups.values()).sort((a, b) => b.cost - a.cost)
}

export function countStockStates(items: InventoryItem[]) {
  const counts = { "in-stock": 0, "low-stock": 0, "out-of-stock": 0 }
  for (const item of items) counts[getStockState(item)] += 1
  return counts
}

export type ActivityKind = "shipment" | "alert" | "restock" | "reorder"

export interface ActivityEntry {
  id: string
  kind: ActivityKind
  message: string
  minutesAgo: number
}

// Mock STOCK_MOVEMENTS feed until Snowflake is wired up.
export const MOCK_ACTIVITY: ActivityEntry[] = [
  { id: "act-1", kind: "shipment", message: "Shipped 38 BOX-MED-100 from Brooklyn DC", minutesAgo: 4 },
  { id: "act-2", kind: "alert", message: "Thermal Shipping Labels fell below threshold (12 left)", minutesAgo: 22 },
  { id: "act-3", kind: "reorder", message: "PO sent to CushionPro for 3 SKUs", minutesAgo: 75 },
  { id: "act-4", kind: "restock", message: "Heavy-Duty Packing Tape restocked (+120 units)", minutesAgo: 140 },
  { id: "act-5", kind: "alert", message: "Poly Mailer Bags are out of stock", minutesAgo: 210 },
  { id: "act-6", kind: "shipment", message: "Shipped 12 FOAM-AS-024 from Newark FC", minutesAgo: 300 },
]

export function formatMinutesAgo(minutes: number): string {
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${Math.round(value)}`
}
