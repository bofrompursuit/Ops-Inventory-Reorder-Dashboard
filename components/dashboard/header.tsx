import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { BellIcon, PanelLeftIcon, SearchIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"

export function Header({
  title,
  icon: Icon,
  demoMode,
  lowStockCount,
  onToggleSidebar,
  search,
  onSearchChange,
}: {
  title: string
  icon: LucideIcon
  demoMode: boolean
  lowStockCount: number
  onToggleSidebar: () => void
  search?: string
  onSearchChange?: (value: string) => void
}) {
  return (
    <header className="sticky top-0 z-40 rounded-t-xl border-b border-border bg-background/90 backdrop-blur">
      <nav className="flex h-14 items-center justify-between gap-2 px-3">
        <div className="flex min-w-0 items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
<img src="/icon.svg" alt="" className="size-7 rounded-lg lg:hidden" />
          <Button
            variant="ghost"
            size="icon-sm"
            className="hidden lg:inline-flex"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <PanelLeftIcon />
          </Button>
          <div className="flex items-center gap-2 pl-1 text-[15px] font-semibold">
            <Icon className="size-4 text-muted-foreground" />
            {title}
          </div>
          {demoMode && (
            <Badge variant="secondary" className="ml-1 hidden md:inline-flex">
              Demo data
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onSearchChange && (
            <div className="relative mr-1 hidden sm:block">
              <SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search ?? ""}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search products or SKUs…"
                className="h-8 w-64 bg-card pl-8 text-sm"
              />
            </div>
          )}
          <ThemeToggle />
          <Button variant="ghost" size="icon-sm" className="relative" asChild>
            <Link href="/products?status=low-stock" aria-label={`${lowStockCount} low-stock alerts`}>
              <BellIcon />
              {lowStockCount > 0 && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-rose-500" />
              )}
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
