"use client"

import * as React from "react"
import { LayoutDashboardIcon, PackageIcon, WarehouseIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Overview", href: "#overview", icon: LayoutDashboardIcon },
  { label: "Inventory", href: "#inventory", icon: PackageIcon },
]

export function Sidebar() {
  const [activeHref, setActiveHref] = React.useState(NAV_ITEMS[0].href)

  React.useEffect(() => {
    const sections = NAV_ITEMS.map((item) =>
      document.querySelector(item.href)
    ).filter((section): section is Element => section !== null)

    if (sections.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) {
          setActiveHref(`#${visible.target.id}`)
        }
      },
      { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <WarehouseIcon className="size-5 text-sidebar-primary" />
        <span className="font-heading text-sm font-semibold">Ops Inventory</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === activeHref
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon
                className={cn("size-4", isActive && "text-sidebar-primary")}
              />
              {item.label}
            </a>
          )
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3 text-xs text-sidebar-foreground/60">
        Reorder &amp; Inventory Ops
      </div>
    </aside>
  )
}
