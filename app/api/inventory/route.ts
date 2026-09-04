import { NextResponse } from "next/server"
import {
  createInventoryItem,
  getInventoryItems,
  updateInventoryQuantity,
} from "@/lib/airtable"
import type { CreateInventoryInput, UpdateQuantityInput } from "@/lib/types"

export async function GET() {
  try {
    const result = await getInventoryItems()
    return NextResponse.json(result)
  } catch (error) {
    console.error("GET /api/inventory failed:", error)
    return NextResponse.json(
      { error: "Failed to load inventory." },
      { status: 500 }
    )
  }
}

function parseCreateInput(body: unknown): CreateInventoryInput | null {
  if (typeof body !== "object" || body === null) return null
  const record = body as Record<string, unknown>

  const itemName = record.itemName
  const sku = record.sku
  const quantity = record.quantity
  const reorderThreshold = record.reorderThreshold
  const unitPrice = record.unitPrice
  const supplierEmail = record.supplierEmail

  if (
    typeof itemName !== "string" ||
    typeof sku !== "string" ||
    typeof quantity !== "number" ||
    typeof reorderThreshold !== "number" ||
    typeof unitPrice !== "number" ||
    typeof supplierEmail !== "string" ||
    !itemName.trim() ||
    !sku.trim()
  ) {
    return null
  }

  return { itemName, sku, quantity, reorderThreshold, unitPrice, supplierEmail }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const input = parseCreateInput(body)

    if (!input) {
      return NextResponse.json(
        {
          error:
            "Invalid payload. Required fields: itemName, sku, quantity, reorderThreshold, unitPrice, supplierEmail.",
        },
        { status: 400 }
      )
    }

    const item = await createInventoryItem(input)
    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error("POST /api/inventory failed:", error)
    return NextResponse.json(
      { error: "Failed to create inventory item." },
      { status: 500 }
    )
  }
}

function parseUpdateInput(body: unknown): UpdateQuantityInput | null {
  if (typeof body !== "object" || body === null) return null
  const record = body as Record<string, unknown>

  const { id, quantity } = record

  if (typeof id !== "string" || typeof quantity !== "number" || quantity < 0) {
    return null
  }

  return { id, quantity }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const input = parseUpdateInput(body)

    if (!input) {
      return NextResponse.json(
        { error: "Invalid payload. Required fields: id (string), quantity (number >= 0)." },
        { status: 400 }
      )
    }

    const item = await updateInventoryQuantity(input)
    return NextResponse.json({ item })
  } catch (error) {
    console.error("PATCH /api/inventory failed:", error)
    const message =
      error instanceof Error ? error.message : "Failed to update quantity."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
