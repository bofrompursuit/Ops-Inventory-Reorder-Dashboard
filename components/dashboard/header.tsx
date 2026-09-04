import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/dashboard/theme-toggle"

export function Header({ demoMode }: { demoMode: boolean }) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur-sm supports-backdrop-filter:bg-background/60 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate font-heading text-base font-semibold">
          Inventory Dashboard
        </h1>
        {demoMode && (
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Demo Mode
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">BM</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
