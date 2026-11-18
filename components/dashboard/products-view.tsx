"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronsUpDownIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  FilterIcon,
  MailIcon,
  MoreHorizontalIcon,
  PackageCheckIcon,
  PackageIcon,
  PackageXIcon,
  PencilIcon,
  SearchIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  KpiCard,
  Panel,
  ProductAvatar,
  ProgressBar,
  StockBadge,
} from "@/components/dashboard/primitives"
import { getDaysOfCover } from "@/lib/email"
import { formatCurrency, formatNumber } from "@/lib/format"
import { countStockStates, getItemCategory, getItemWarehouse } from "@/lib/ops"
import { cn } from "@/lib/utils"
import {
  getInventoryStatus,
  getInventoryTotalValue,
  getStockState,
  type InventoryItem,
  type StockState,
} from "@/lib/types"

export type StatusFilter = "all" | "in-stock" | "low-stock" | "out-of-stock"
type SortField = "itemName" | "category" | "unitPrice" | "quantity" | "cover" | "value"
type SortDirection = "asc" | "desc"

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "in-stock", label: "In stock" },
  { value: "low-stock", label: "Needs reorder" },
  { value: "out-of-stock", label: "Out of stock" },
]

const STOCK_BAR: Record<StockState, string> = {
  "in-stock": "bg-emerald-500",
  "low-stock": "bg-orange-500",
  "out-of-stock": "bg-rose-500",
}

function matchesStatus(item: InventoryItem, filter: StatusFilter) {
  if (filter === "all") return true
  if (filter === "low-stock") return getInventoryStatus(item) === "low-stock"
  return getStockState(item) === filter
}

export function ProductsView({
  items,
  search,
  onSearchChange,
  initialStatus,
  onUpdateQuantity,
  onGenerateEmail,
}: {
  items: InventoryItem[]
  search: string
  onSearchChange: (value: string) => void
  initialStatus: StatusFilter
  onUpdateQuantity: (item: InventoryItem) => void
  onGenerateEmail: (items: InventoryItem[]) => void
}) {
  const [status, setStatus] = React.useState<StatusFilter>(initialStatus)
  const [category, setCategory] = React.useState("all")
  const [warehouse, setWarehouse] = React.useState("all")
  const [sortField, setSortField] = React.useState<SortField>("itemName")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")
  const [pageSize, setPageSize] = React.useState(8)
  // Page is remembered per filter combination, so any filter change starts at page 1.
  const filterKey = [search, status, category, warehouse, pageSize].join("|")
  const [pageState, setPageState] = React.useState({ key: filterKey, page: 0 })
  const page = pageState.key === filterKey ? pageState.page : 0
  const setPage = (next: number) => setPageState({ key: filterKey, page: next })

  const states = countStockStates(items)
  const categories = React.useMemo(
    () => Array.from(new Set(items.map(getItemCategory))).sort(),
    [items]
  )
  const warehouses = React.useMemo(
    () => Array.from(new Set(items.map(getItemWarehouse))).sort(),
    [items]
  )

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    const rows = items.filter(
      (item) =>
        (!query ||
          item.itemName.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query)) &&
        matchesStatus(item, status) &&
        (category === "all" || getItemCategory(item) === category) &&
        (warehouse === "all" || getItemWarehouse(item) === warehouse)
    )
    const direction = sortDirection === "asc" ? 1 : -1
    const sortValue = (item: InventoryItem): number | string => {
      switch (sortField) {
        case "itemName":
          return item.itemName
        case "category":
          return getItemCategory(item)
        case "unitPrice":
          return item.unitPrice
        case "quantity":
          return item.quantity
        case "cover":
          return getDaysOfCover(item) ?? Number.POSITIVE_INFINITY
        case "value":
          return getInventoryTotalValue(item)
      }
    }
    return [...rows].sort((a, b) => {
      const av = sortValue(a)
      const bv = sortValue(b)
      if (typeof av === "string" && typeof bv === "string") {
        return av.localeCompare(bv) * direction
      }
      return ((av as number) - (bv as number)) * direction
    })
  }, [items, search, status, category, warehouse, sortField, sortDirection])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const pageRows = filtered.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
  const reorderable = filtered.filter((item) => getInventoryStatus(item) === "low-stock")
  const activeFilters =
    Number(status !== "all") + Number(category !== "all") + Number(warehouse !== "all")

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection(field === "itemName" || field === "category" ? "asc" : "desc")
    }
  }

  const sortProps = { activeField: sortField, direction: sortDirection, onToggle: toggleSort }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <KpiCard
          label="Total products"
          value={formatNumber(items.length)}
          hint="Across all warehouses"
          icon={PackageIcon}
        />
        <KpiCard
          label="In stock"
          value={formatNumber(states["in-stock"])}
          hint="Above reorder threshold"
          icon={PackageCheckIcon}
          tone="green"
          valueTone="green"
        />
        <KpiCard
          label="Low stock"
          value={formatNumber(states["low-stock"])}
          hint="Need restocking"
          icon={AlertTriangleIcon}
          tone="orange"
          valueTone="orange"
        />
        <KpiCard
          label="Out of stock"
          value={formatNumber(states["out-of-stock"])}
          hint="Unavailable"
          icon={PackageXIcon}
          tone="red"
          valueTone="red"
        />
      </div>

      <Panel className="p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Product catalog</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {filtered.length} product{filtered.length === 1 ? "" : "s"} found
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative sm:hidden">
              <SearchIcon className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search…"
                className="h-8 w-44 pl-8"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={reorderable.length === 0}
              onClick={() => onGenerateEmail(reorderable)}
            >
              <MailIcon />
              Reorder {reorderable.length > 0 ? reorderable.length : ""}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FilterIcon />
                  Filter
                  {activeFilters > 0 && (
                    <span className="rounded bg-primary px-1 text-[10px] text-primary-foreground tabular-nums">
                      {activeFilters}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={status}
                  onValueChange={(value) => setStatus(value as StatusFilter)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={category} onValueChange={setCategory}>
                  <DropdownMenuRadioItem value="all">All categories</DropdownMenuRadioItem>
                  {categories.map((name) => (
                    <DropdownMenuRadioItem key={name} value={name}>
                      {name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Warehouse</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={warehouse} onValueChange={setWarehouse}>
                  <DropdownMenuRadioItem value="all">All warehouses</DropdownMenuRadioItem>
                  {warehouses.map((name) => (
                    <DropdownMenuRadioItem key={name} value={name}>
                      {name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                {activeFilters > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setStatus("all")
                        setCategory("all")
                        setWarehouse("all")
                      }}
                    >
                      Clear filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">
                <SortButton field="itemName" {...sortProps}>Product</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="category" {...sortProps}>Category</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="unitPrice" {...sortProps}>Price</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="quantity" {...sortProps}>Stock</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="cover" {...sortProps}>Cover</SortButton>
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">Status</TableHead>
              <TableHead className="text-xs text-muted-foreground">Warehouse</TableHead>
              <TableHead>
                <SortButton field="value" {...sortProps}>Value</SortButton>
              </TableHead>
              <TableHead className="pr-5 text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-28 text-center text-muted-foreground">
                  No products match your search or filters.
                </TableCell>
              </TableRow>
            )}
            {pageRows.map((item) => {
              const state = getStockState(item)
              const needsReorder = getInventoryStatus(item) === "low-stock"
              const cover = getDaysOfCover(item)
              const stockPercent = (item.quantity / Math.max(item.reorderThreshold * 3, 1)) * 100
              return (
                <TableRow key={item.id}>
                  <TableCell className="py-3 pl-5">
                    <div className="flex items-center gap-3">
                      <ProductAvatar sku={item.sku} />
                      <div className="min-w-0">
                        <p className="max-w-64 truncate font-medium">{item.itemName}</p>
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{getItemCategory(item)}</TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <ProgressBar
                        value={stockPercent}
                        className="w-16"
                        barClassName={STOCK_BAR[state]}
                      />
                      <span className="w-10 tabular-nums">{formatNumber(item.quantity)}</span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={cn(
                      "tabular-nums",
                      cover !== null && item.leadTimeDays && cover < item.leadTimeDays
                        ? "font-medium text-rose-600 dark:text-rose-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {cover === null ? "—" : cover > 365 ? "1y+" : `${Math.round(cover)}d`}
                  </TableCell>
                  <TableCell>
                    <StockBadge state={state} />
                  </TableCell>
                  <TableCell>
                    <span className="rounded-md border border-border px-2 py-0.5 text-xs whitespace-nowrap text-muted-foreground">
                      {getItemWarehouse(item)}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {formatCurrency(getInventoryTotalValue(item))}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onUpdateQuantity(item)}>
                          <PencilIcon />
                          Update quantity
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onGenerateEmail([item])}
                          disabled={!needsReorder}
                        >
                          <MailIcon />
                          Draft reorder email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              Showing {filtered.length === 0 ? 0 : currentPage * pageSize + 1}–
              {Math.min((currentPage + 1) * pageSize, filtered.length)} of {filtered.length}
            </span>
            <span className="hidden text-xs sm:inline">Per page</span>
            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger size="sm" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[8, 16, 32].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage === 0}
              onClick={() => setPage(0)}
              aria-label="First page"
            >
              <ChevronsLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeftIcon />
            </Button>
            <span className="px-2 text-sm tabular-nums">
              {currentPage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(currentPage + 1)}
              aria-label="Next page"
            >
              <ChevronRightIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(pageCount - 1)}
              aria-label="Last page"
            >
              <ChevronsRightIcon />
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function SortButton({
  field,
  activeField,
  direction,
  onToggle,
  children,
}: {
  field: SortField
  activeField: SortField
  direction: SortDirection
  onToggle: (field: SortField) => void
  children: React.ReactNode
}) {
  const isActive = activeField === field
  const Icon = !isActive ? ChevronsUpDownIcon : direction === "asc" ? ArrowUpIcon : ArrowDownIcon
  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      {children}
      <Icon className={cn("size-3", !isActive && "opacity-60")} />
    </button>
  )
}
