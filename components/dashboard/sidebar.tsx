"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  CircleHelpIcon,
  LayoutDashboardIcon,
  MailIcon,
  PackageIcon,
  SettingsIcon,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProgressBar, utilizationColor } from "@/components/dashboard/primitives"
import { cn } from "@/lib/utils"
import type { summarizeWarehouses } from "@/lib/ops"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboardIcon },
  { label: "Products", href: "/products", icon: PackageIcon },
]

const navItemClass =
  "flex h-9 w-full items-center gap-2.5 rounded-lg text-sm transition-colors"

export function Sidebar({
  collapsed,
  warehouses,
  reorderCount,
  onOpenReorders,
}: {
  collapsed: boolean
  warehouses: ReturnType<typeof summarizeWarehouses>
  reorderCount: number
  onOpenReorders: () => void
}) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col py-2 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[60px] px-2" : "w-64 px-2"
      )}
    >
      <div className={cn("flex h-12 items-center gap-2", collapsed ? "justify-center" : "px-2")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
<img src="/icon.svg" alt="" className="size-7 rounded-lg" />
        {!collapsed && <span className="text-sm font-semibold">Ops Inventory</span>}
      </div>

      <nav className="mt-2 flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                navItemClass,
                collapsed ? "justify-center" : "px-2.5",
                isActive
                  ? "bg-card font-medium shadow-xs ring-1 ring-border"
                  : "text-foreground/80 hover:bg-card hover:text-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!collapsed && item.label}
            </Link>
          )
        })}
        <button
          type="button"
          onClick={onOpenReorders}
          disabled={reorderCount === 0}
          title={collapsed ? "Reorders" : undefined}
          className={cn(
            navItemClass,
            "text-foreground/80 hover:bg-card hover:text-foreground disabled:opacity-50",
            collapsed ? "justify-center" : "px-2.5"
          )}
        >
          <MailIcon className="size-4 shrink-0" />
          {!collapsed && (
            <>
              Reorders
              {reorderCount > 0 && (
                <span className="ml-auto rounded-md bg-rose-500/10 px-1.5 text-xs font-medium text-rose-600 tabular-nums dark:text-rose-400">
                  {reorderCount}
                </span>
              )}
            </>
          )}
        </button>
      </nav>

      {!collapsed && warehouses.length > 0 && (
        <div className="mt-6 px-2">
          <p className="mb-3 text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Warehouses
          </p>
          <div className="flex flex-col gap-4">
            {warehouses.map((warehouse) => (
              <div key={warehouse.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{warehouse.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {warehouse.utilization}%
                  </span>
                </div>
                <ProgressBar
                  value={warehouse.utilization}
                  barClassName={utilizationColor(warehouse.utilization)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-0.5">
        {[
          { label: "Settings", icon: SettingsIcon },
          { label: "Help", icon: CircleHelpIcon },
        ].map((item) => (
          <span
            key={item.label}
            title={collapsed ? item.label : undefined}
            className={cn(
              navItemClass,
              "text-foreground/70",
              collapsed ? "justify-center" : "px-2.5"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </span>
        ))}
        <div
          className={cn(
            "mt-2 flex items-center gap-2.5 rounded-xl border border-border bg-card p-2.5",
            collapsed && "justify-center border-0 bg-transparent p-0"
          )}
        >
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">BM</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-medium">Bo Moldenhauer</p>
              <p className="truncate text-xs text-muted-foreground">Operations</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
