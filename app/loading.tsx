import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex flex-col gap-2 p-3">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-6">
          <Skeleton className="h-4 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="size-8 rounded-full" />
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index}>
                <CardHeader className="gap-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-7 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-3 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="gap-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-8 w-44 rounded-lg" />
              </div>
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-8 w-full max-w-xs rounded-lg" />
                <Skeleton className="h-8 w-40 rounded-lg" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-9 w-full" />
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
