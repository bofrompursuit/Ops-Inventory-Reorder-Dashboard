import { LayoutDashboardIcon, PackageIcon, WarehouseIcon } from "lucide-react"

const NAV_ITEMS = [
  { label: "Overview", href: "#overview", icon: LayoutDashboardIcon },
  { label: "Inventory", href: "#inventory", icon: PackageIcon },
]

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <WarehouseIcon className="size-5 text-sidebar-primary" />
        <span className="font-heading text-sm font-semibold">Ops Inventory</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <item.icon className="size-4" />
            {item.label}
          </a>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/60">
        Reorder &amp; Inventory Ops
      </div>
    </aside>
  )
}
