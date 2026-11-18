export interface InventoryItem {
  id: string
  itemName: string
  sku: string
  quantity: number
  reorderThreshold: number
  unitPrice: number
  supplierEmail: string
  // Optional ops context. Mirrors the planned Snowflake INVENTORY columns;
  // Airtable records may not have them, so every consumer needs a fallback.
  category?: string
  warehouse?: string
  dailyUsage?: number
  leadTimeDays?: number
}

export type InventoryStatus = "low-stock" | "in-stock"

export function getInventoryStatus(item: InventoryItem): InventoryStatus {
  return item.quantity <= item.reorderThreshold ? "low-stock" : "in-stock"
}

export function getInventoryTotalValue(item: InventoryItem): number {
  return item.quantity * item.unitPrice
}

export type StockState = "out-of-stock" | "low-stock" | "in-stock"

export function getStockState(item: InventoryItem): StockState {
  if (item.quantity <= 0) return "out-of-stock"
  return getInventoryStatus(item)
}

export interface InventorySummary {
  totalInventoryValue: number
  totalSkus: number
  lowStockCount: number
}

export function summarizeInventory(items: InventoryItem[]): InventorySummary {
  return {
    totalInventoryValue: items.reduce(
      (sum, item) => sum + getInventoryTotalValue(item),
      0
    ),
    totalSkus: items.length,
    lowStockCount: items.filter((item) => getInventoryStatus(item) === "low-stock")
      .length,
  }
}

export interface GetInventoryResult {
  items: InventoryItem[]
  demoMode: boolean
  demoReason?: string
}

export interface CreateInventoryInput {
  itemName: string
  sku: string
  quantity: number
  reorderThreshold: number
  unitPrice: number
  supplierEmail: string
}

export interface UpdateQuantityInput {
  id: string
  quantity: number
}
