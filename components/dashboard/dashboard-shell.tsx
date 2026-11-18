"use client"

import * as React from "react"
import { LayoutDashboardIcon, PackageIcon } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/dashboard/header"
import { Overview } from "@/components/dashboard/overview"
import { ProductsView, type StatusFilter } from "@/components/dashboard/products-view"
import { ReorderEmailModal } from "@/components/dashboard/reorder-email-modal"
import { Sidebar } from "@/components/dashboard/sidebar"
import { SiteFooter } from "@/components/dashboard/site-footer"
import { UpdateQuantityModal } from "@/components/dashboard/update-quantity-modal"
import { MOCK_ACTIVITY, getReorderSuggestions, summarizeWarehouses, type ActivityEntry } from "@/lib/ops"
import { summarizeInventory, type GetInventoryResult, type InventoryItem } from "@/lib/types"

const PAGES = {
  dashboard: {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    heading: "Inventory overview",
    subheading: "What's running low, what to reorder and who to email, at a glance.",
  },
  products: {
    title: "Products",
    icon: PackageIcon,
    heading: "Product catalog",
    subheading: "Every SKU across your warehouses, with stock levels and days of cover.",
  },
}

export function DashboardShell({
  initialData,
  page,
  initialStatus = "all",
}: {
  initialData: GetInventoryResult
  page: keyof typeof PAGES
  initialStatus?: StatusFilter
}) {
  const [items, setItems] = React.useState<InventoryItem[]>(initialData.items)
  const [activity, setActivity] = React.useState<ActivityEntry[]>(MOCK_ACTIVITY)
  const { demoMode } = initialData

  const [quantityTarget, setQuantityTarget] = React.useState<InventoryItem | null>(null)
  const [emailItems, setEmailItems] = React.useState<InventoryItem[] | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const summary = React.useMemo(() => summarizeInventory(items), [items])
  const warehouses = React.useMemo(() => summarizeWarehouses(items), [items])
  const reorderItems = React.useMemo(
    () => getReorderSuggestions(items).map((suggestion) => suggestion.item),
    [items]
  )

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

      const delta = newQuantity - item.quantity
      setActivity((current) => [
        {
          id: `act-${Date.now()}`,
          kind: delta >= 0 ? "restock" : "shipment",
          message:
            delta >= 0
              ? `${item.itemName} restocked (+${delta} units)`
              : `${item.itemName} adjusted (${delta} units)`,
          minutesAgo: 0,
        },
        ...current,
      ])
      toast.success(`Updated ${item.sku} to ${newQuantity} units`)
    } catch (error) {
      setItems(previousItems)
      toast.error(
        error instanceof Error ? error.message : "Failed to update quantity."
      )
    }
  }

  const { title, icon, heading, subheading } = PAGES[page]

  return (
    <div className="flex min-h-screen bg-sidebar">
      <Sidebar
        collapsed={sidebarCollapsed}
        warehouses={warehouses}
        reorderCount={reorderItems.length}
        onOpenReorders={() => setEmailItems(reorderItems)}
      />
      <div className="m-2 flex min-w-0 flex-1 flex-col rounded-xl border border-border bg-background lg:ml-0">
        <Header
          title={title}
          icon={icon}
          demoMode={demoMode}
          lowStockCount={summary.lowStockCount}
          onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
          search={page === "products" ? search : undefined}
          onSearchChange={page === "products" ? setSearch : undefined}
        />
        <main className="w-full flex-1 p-4 sm:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{heading}</h1>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">{subheading}</p>
          </div>
          {page === "dashboard" ? (
            <Overview
              items={items}
              activity={activity}
              onGenerateEmail={setEmailItems}
              onUpdateQuantity={setQuantityTarget}
            />
          ) : (
            <ProductsView
              items={items}
              search={search}
              onSearchChange={setSearch}
              initialStatus={initialStatus}
              onUpdateQuantity={setQuantityTarget}
              onGenerateEmail={setEmailItems}
            />
          )}
        </main>
        <SiteFooter demoMode={demoMode} />
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
