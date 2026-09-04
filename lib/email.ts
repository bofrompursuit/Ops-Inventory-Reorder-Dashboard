import type { InventoryItem } from "@/lib/types"

export interface ReorderLineItem {
  item: InventoryItem
  recommendedQuantity: number
}

export function getRecommendedReorderQuantity(item: InventoryItem): number {
  const target = item.reorderThreshold * 2
  return Math.max(target - item.quantity, item.reorderThreshold, 1)
}

export function groupItemsBySupplier(
  items: InventoryItem[]
): Map<string, InventoryItem[]> {
  const groups = new Map<string, InventoryItem[]>()
  for (const item of items) {
    const key = item.supplierEmail || "unknown@supplier.com"
    const existing = groups.get(key)
    if (existing) {
      existing.push(item)
    } else {
      groups.set(key, [item])
    }
  }
  return groups
}

export function buildReorderEmail(
  supplierEmail: string,
  items: InventoryItem[]
): { subject: string; body: string } {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const poNumber = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${items[0]?.sku ?? "REORDER"}`

  const subject =
    items.length === 1
      ? `Purchase Order Request – ${items[0].sku} Reorder`
      : `Purchase Order Request – ${items.length} Items Reorder`

  const lineItems = items
    .map((item) => {
      const recommendedQuantity = getRecommendedReorderQuantity(item)
      return [
        `  Item: ${item.itemName}`,
        `  SKU: ${item.sku}`,
        `  Current Quantity On Hand: ${item.quantity}`,
        `  Reorder Threshold: ${item.reorderThreshold}`,
        `  Recommended Reorder Quantity: ${recommendedQuantity}`,
        `  Estimated Unit Price: $${item.unitPrice.toFixed(2)}`,
      ].join("\n")
    })
    .join("\n\n")

  const body = `Date: ${today}

Hello,

We would like to place a reorder for the following item${items.length > 1 ? "s" : ""}, currently at or below our reorder threshold:

${lineItems}

Please confirm availability, pricing, and estimated lead time at your earliest convenience. Reference this request as ${poNumber} in your reply.

Standard Purchase Order Terms:
- Payment Terms: Net 30
- Shipping: Standard ground, please advise if expedited options are available
- Please include SKU numbers on the packing slip and invoice

Thank you for your continued support.

Best regards,
Operations Team`

  return { subject, body }
}
