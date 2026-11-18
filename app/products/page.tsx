import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import type { StatusFilter } from "@/components/dashboard/products-view"
import { getInventoryItems } from "@/lib/airtable"

export const dynamic = "force-dynamic"

const STATUSES: StatusFilter[] = ["all", "in-stock", "low-stock", "out-of-stock"]

export default async function ProductsPage({ searchParams }: PageProps<"/products">) {
  const { status } = await searchParams
  const initialStatus = STATUSES.find((value) => value === status) ?? "all"
  const initialData = await getInventoryItems()

  return <DashboardShell initialData={initialData} page="products" initialStatus={initialStatus} />
}
