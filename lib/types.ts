export interface InventoryItem {
  id: string
  itemName: string
  sku: string
  quantity: number
  reorderThreshold: number
  unitPrice: number
  supplierEmail: string
}

export type InventoryStatus = "low-stock" | "in-stock"

export function getInventoryStatus(item: InventoryItem): InventoryStatus {
  return item.quantity <= item.reorderThreshold ? "low-stock" : "in-stock"
}

export function getInventoryTotalValue(item: InventoryItem): number {
  return item.quantity * item.unitPrice
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
