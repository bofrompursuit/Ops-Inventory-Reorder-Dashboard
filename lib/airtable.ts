import Airtable from "airtable"
import { MOCK_INVENTORY_ITEMS } from "@/lib/mock-data"
import type {
  CreateInventoryInput,
  GetInventoryResult,
  InventoryItem,
  UpdateQuantityInput,
} from "@/lib/types"

const AIRTABLE_FIELDS = {
  itemName: "Item Name",
  sku: "SKU",
  quantity: "Quantity",
  reorderThreshold: "Reorder Threshold",
  unitPrice: "Unit Price",
  supplierEmail: "Supplier Email",
} as const

type AirtableFieldSet = Airtable.FieldSet
type AirtableRecord = Airtable.Record<AirtableFieldSet>

let cachedBase: Airtable.Base | null = null

// In-memory store used only when Airtable is not configured/reachable, so the
// demo experience (create/update) behaves consistently within a running
// server process without a real backing database.
let demoStore: InventoryItem[] | null = null

function getDemoStore(): InventoryItem[] {
  if (!demoStore) {
    demoStore = MOCK_INVENTORY_ITEMS.map((item) => ({ ...item }))
  }
  return demoStore
}

export function isAirtableConfigured(): boolean {
  return Boolean(process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID)
}

function getTableName(): string {
  return process.env.AIRTABLE_TABLE_NAME || "Inventory"
}

function getBase() {
  if (cachedBase) return cachedBase

  const apiKey = process.env.AIRTABLE_API_KEY
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!apiKey || !baseId) {
    throw new Error(
      "Airtable is not configured. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID."
    )
  }

  cachedBase = new Airtable({ apiKey }).base(baseId)
  return cachedBase
}

function recordToItem(record: AirtableRecord): InventoryItem {
  const fields = record.fields
  return {
    id: record.id,
    itemName: String(fields[AIRTABLE_FIELDS.itemName] ?? ""),
    sku: String(fields[AIRTABLE_FIELDS.sku] ?? ""),
    quantity: Number(fields[AIRTABLE_FIELDS.quantity] ?? 0),
    reorderThreshold: Number(fields[AIRTABLE_FIELDS.reorderThreshold] ?? 0),
    unitPrice: Number(fields[AIRTABLE_FIELDS.unitPrice] ?? 0),
    supplierEmail: String(fields[AIRTABLE_FIELDS.supplierEmail] ?? ""),
  }
}

function inputToFields(input: CreateInventoryInput): AirtableFieldSet {
  return {
    [AIRTABLE_FIELDS.itemName]: input.itemName,
    [AIRTABLE_FIELDS.sku]: input.sku,
    [AIRTABLE_FIELDS.quantity]: input.quantity,
    [AIRTABLE_FIELDS.reorderThreshold]: input.reorderThreshold,
    [AIRTABLE_FIELDS.unitPrice]: input.unitPrice,
    [AIRTABLE_FIELDS.supplierEmail]: input.supplierEmail,
  }
}

export async function getInventoryItems(): Promise<GetInventoryResult> {
  if (!isAirtableConfigured()) {
    return {
      items: getDemoStore(),
      demoMode: true,
      demoReason:
        "AIRTABLE_API_KEY and AIRTABLE_BASE_ID are not set in the environment.",
    }
  }

  try {
    const base = getBase()
    const records = await base(getTableName()).select().all()
    return {
      items: records.map(recordToItem),
      demoMode: false,
    }
  } catch (error) {
    console.error("Airtable fetch failed, falling back to demo data:", error)
    return {
      items: getDemoStore(),
      demoMode: true,
      demoReason:
        error instanceof Error
          ? error.message
          : "Unable to reach Airtable.",
    }
  }
}

export async function createInventoryItem(
  input: CreateInventoryInput
): Promise<InventoryItem> {
  if (!isAirtableConfigured()) {
    const store = getDemoStore()
    const item: InventoryItem = { id: `demo-${Date.now()}`, ...input }
    store.push(item)
    return item
  }

  const base = getBase()
  const [created] = await base(getTableName()).create([
    { fields: inputToFields(input) },
  ])
  return recordToItem(created)
}

export async function updateInventoryQuantity(
  input: UpdateQuantityInput
): Promise<InventoryItem> {
  if (!isAirtableConfigured()) {
    const store = getDemoStore()
    const existing = store.find((item) => item.id === input.id)
    if (!existing) {
      throw new Error(`No inventory item found with id "${input.id}".`)
    }
    existing.quantity = input.quantity
    return existing
  }

  const base = getBase()
  const [updated] = await base(getTableName()).update([
    { id: input.id, fields: { [AIRTABLE_FIELDS.quantity]: input.quantity } },
  ])
  return recordToItem(updated)
}
