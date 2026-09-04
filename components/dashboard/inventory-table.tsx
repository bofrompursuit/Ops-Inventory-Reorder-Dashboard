"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  MailIcon,
  MoreHorizontalIcon,
  PencilIcon,
  SearchIcon,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { formatCurrency, formatNumber } from "@/lib/format"
import {
  getInventoryStatus,
  getInventoryTotalValue,
  type InventoryItem,
} from "@/lib/types"

type StatusFilter = "all" | "low-stock"
type SortField = "itemName" | "sku" | "quantity" | "reorderThreshold" | "unitPrice" | "totalValue"
type SortDirection = "asc" | "desc"

interface InventoryTableProps {
  items: InventoryItem[]
  onUpdateQuantity: (item: InventoryItem) => void
  onGenerateEmail: (items: InventoryItem[]) => void
}

export function InventoryTable({
  items,
  onUpdateQuantity,
  onGenerateEmail,
}: InventoryTableProps) {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [sortField, setSortField] = React.useState<SortField>("itemName")
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("asc")

  const lowStockItems = React.useMemo(
    () => items.filter((item) => getInventoryStatus(item) === "low-stock"),
    [items]
  )

  const filteredItems = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    const filtered = items.filter((item) => {
      const matchesQuery =
        !query ||
        item.itemName.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === "all" || getInventoryStatus(item) === "low-stock"
      return matchesQuery && matchesStatus
    })

    const sorted = [...filtered].sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1
      switch (sortField) {
        case "itemName":
          return a.itemName.localeCompare(b.itemName) * direction
        case "sku":
          return a.sku.localeCompare(b.sku) * direction
        case "quantity":
          return (a.quantity - b.quantity) * direction
        case "reorderThreshold":
          return (a.reorderThreshold - b.reorderThreshold) * direction
        case "unitPrice":
          return (a.unitPrice - b.unitPrice) * direction
        case "totalValue":
          return (
            (getInventoryTotalValue(a) - getInventoryTotalValue(b)) * direction
          )
        default:
          return 0
      }
    })

    return sorted
  }, [items, search, statusFilter, sortField, sortDirection])

  function toggleSort(field: SortField) {
    if (field === sortField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <CardTitle>Inventory</CardTitle>
          <Button
            variant="outline"
            size="sm"
            disabled={lowStockItems.length === 0}
            onClick={() => onGenerateEmail(lowStockItems)}
          >
            <MailIcon />
            Generate Reorder Emails
            {lowStockItems.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {lowStockItems.length}
              </Badge>
            )}
          </Button>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <SearchIcon className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-8"
            />
          </div>
          <Tabs
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="low-stock">
                Low Stock Only
                {lowStockItems.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5">
                    {lowStockItems.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <SortButton
                  field="itemName"
                  activeField={sortField}
                  direction={sortDirection}
                  onToggle={toggleSort}
                >
                  Item Name
                </SortButton>
              </TableHead>
              <TableHead>
                <SortButton
                  field="sku"
                  activeField={sortField}
                  direction={sortDirection}
                  onToggle={toggleSort}
                >
                  SKU
                </SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton
                  field="quantity"
                  activeField={sortField}
                  direction={sortDirection}
                  onToggle={toggleSort}
                >
                  Quantity
                </SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton
                  field="reorderThreshold"
                  activeField={sortField}
                  direction={sortDirection}
                  onToggle={toggleSort}
                >
                  Threshold
                </SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton
                  field="unitPrice"
                  activeField={sortField}
                  direction={sortDirection}
                  onToggle={toggleSort}
                >
                  Unit Price
                </SortButton>
              </TableHead>
              <TableHead className="text-right">
                <SortButton
                  field="totalValue"
                  activeField={sortField}
                  direction={sortDirection}
                  onToggle={toggleSort}
                >
                  Total Value
                </SortButton>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  No inventory items match your search.
                </TableCell>
              </TableRow>
            )}
            {filteredItems.map((item) => {
              const status = getInventoryStatus(item)
              const isLowStock = status === "low-stock"
              return (
                <TableRow
                  key={item.id}
                  className={cn(
                    isLowStock &&
                      "bg-red-500/5 hover:bg-red-500/10 dark:bg-red-500/10 dark:hover:bg-red-500/15"
                  )}
                >
                  <TableCell className="font-medium">{item.itemName}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {item.sku}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(item.quantity)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatNumber(item.reorderThreshold)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(getInventoryTotalValue(item))}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isLowStock ? "destructive" : "outline"}>
                      {isLowStock ? "Low Stock" : "In Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
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
                          Update Quantity
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onGenerateEmail([item])}
                          disabled={!isLowStock}
                        >
                          <MailIcon />
                          Generate Reorder Email
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
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
  return (
    <button
      type="button"
      onClick={() => onToggle(field)}
      className="flex items-center gap-1 font-medium text-foreground hover:text-foreground/80"
    >
      {children}
      {isActive ? (
        direction === "asc" ? (
          <ArrowUpIcon className="size-3.5" />
        ) : (
          <ArrowDownIcon className="size-3.5" />
        )
      ) : (
        <ArrowUpDownIcon className="size-3.5 text-muted-foreground" />
      )}
    </button>
  )
}
