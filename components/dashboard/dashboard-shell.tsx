"use client"

import * as React from "react"
import { toast } from "sonner"
import { DemoModeBanner } from "@/components/dashboard/demo-mode-banner"
import { Header } from "@/components/dashboard/header"
import { InventoryTable } from "@/components/dashboard/inventory-table"
import { MetricCards } from "@/components/dashboard/metric-cards"
import { ReorderEmailModal } from "@/components/dashboard/reorder-email-modal"
import { Sidebar } from "@/components/dashboard/sidebar"
import { UpdateQuantityModal } from "@/components/dashboard/update-quantity-modal"
import { summarizeInventory, type GetInventoryResult, type InventoryItem } from "@/lib/types"

export function DashboardShell({ initialData }: { initialData: GetInventoryResult }) {
  const [items, setItems] = React.useState<InventoryItem[]>(initialData.items)
  const { demoMode, demoReason } = initialData

  const [quantityTarget, setQuantityTarget] = React.useState<InventoryItem | null>(null)
  const [emailItems, setEmailItems] = React.useState<InventoryItem[] | null>(null)

  const summary = React.useMemo(() => summarizeInventory(items), [items])

  async function handleUpdateQuantity(item: InventoryItem, newQuantity: number) {
    const previousItems = items
    setItems((current) =>
      current.map((existing) =>
        existing.id === item.id ? { ...existing, quantity: newQuantity } : existing
      )
    )

    try {
      const response = await fetch("/api/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, quantity: newQuantity }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? "Failed to update quantity.")
      }

      toast.success(`Updated ${item.sku} to ${newQuantity} units`)
    } catch (error) {
      setItems(previousItems)
      toast.error(
        error instanceof Error ? error.message : "Failed to update quantity."
      )
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header demoMode={demoMode} />
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          {demoMode && <DemoModeBanner reason={demoReason} />}
          <section id="overview" className="scroll-mt-20">
            <MetricCards summary={summary} />
          </section>
          <section id="inventory" className="scroll-mt-20">
            <InventoryTable
              items={items}
              onUpdateQuantity={setQuantityTarget}
              onGenerateEmail={setEmailItems}
            />
          </section>
        </main>
      </div>

      <UpdateQuantityModal
        item={quantityTarget}
        open={quantityTarget !== null}
        onOpenChange={(open) => {
          if (!open) setQuantityTarget(null)
        }}
        onSubmit={handleUpdateQuantity}
      />

      <ReorderEmailModal
        items={emailItems ?? []}
        open={emailItems !== null && emailItems.length > 0}
        onOpenChange={(open) => {
          if (!open) setEmailItems(null)
        }}
      />
    </div>
  )
}
