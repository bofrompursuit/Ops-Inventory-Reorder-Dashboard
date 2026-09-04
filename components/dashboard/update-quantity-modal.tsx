"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { InventoryItem } from "@/lib/types"

interface UpdateQuantityModalProps {
  item: InventoryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (item: InventoryItem, newQuantity: number) => Promise<void>
}

export function UpdateQuantityModal({
  item,
  open,
  onOpenChange,
  onSubmit,
}: UpdateQuantityModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {item && (
          <QuantityForm
            key={item.id}
            item={item}
            onSubmit={onSubmit}
            onDone={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function QuantityForm({
  item,
  onSubmit,
  onDone,
}: {
  item: InventoryItem
  onSubmit: (item: InventoryItem, newQuantity: number) => Promise<void>
  onDone: () => void
}) {
  const [quantity, setQuantity] = React.useState(() => String(item.quantity))
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const parsedQuantity = Number(quantity)
  const isValid =
    quantity.trim() !== "" && Number.isFinite(parsedQuantity) && parsedQuantity >= 0

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)
    try {
      await onSubmit(item, parsedQuantity)
      onDone()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>Update Quantity</DialogTitle>
        <DialogDescription>
          {item.itemName} · {item.sku}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-2 py-2">
        <Label htmlFor="quantity">Quantity on Hand</Label>
        <Input
          id="quantity"
          type="number"
          min={0}
          step={1}
          value={quantity}
          onChange={(event) => setQuantity(event.target.value)}
          autoFocus
        />
        <p className="text-xs text-muted-foreground">
          Reorder threshold is {item.reorderThreshold} units.
        </p>
      </div>

      <DialogFooter>
        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Quantity"}
        </Button>
      </DialogFooter>
    </form>
  )
}
