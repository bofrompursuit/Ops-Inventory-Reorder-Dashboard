import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getInventoryItems } from "@/lib/airtable"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const initialData = await getInventoryItems()

  return <DashboardShell initialData={initialData} />
}
