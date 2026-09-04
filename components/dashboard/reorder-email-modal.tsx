"use client"

import * as React from "react"
import { CheckIcon, CopyIcon, MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { buildReorderEmail, groupItemsBySupplier } from "@/lib/email"
import type { InventoryItem } from "@/lib/types"

interface ReorderEmailModalProps {
  items: InventoryItem[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReorderEmailModal({
  items,
  open,
  onOpenChange,
}: ReorderEmailModalProps) {
  const modalKey = items.map((item) => item.id).join(",")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {items.length > 0 && <ReorderEmailForm key={modalKey} items={items} />}
      </DialogContent>
    </Dialog>
  )
}

function ReorderEmailForm({ items }: { items: InventoryItem[] }) {
  const supplierGroups = React.useMemo(() => groupItemsBySupplier(items), [items])
  const supplierEmails = React.useMemo(
    () => Array.from(supplierGroups.keys()),
    [supplierGroups]
  )

  const [selectedSupplier, setSelectedSupplier] = React.useState(
    () => supplierEmails[0] ?? ""
  )
  const [copied, setCopied] = React.useState(false)

  const activeItems = supplierGroups.get(selectedSupplier) ?? []
  const draft =
    activeItems.length > 0
      ? buildReorderEmail(selectedSupplier, activeItems)
      : null

  async function handleCopy() {
    if (!draft) return
    const text = `Subject: ${draft.subject}\n\n${draft.body}`
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleMailto() {
    if (!draft) return
    const mailto = `mailto:${encodeURIComponent(selectedSupplier)}?subject=${encodeURIComponent(
      draft.subject
    )}&body=${encodeURIComponent(draft.body)}`
    window.location.href = mailto
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Generate Reorder Email</DialogTitle>
        <DialogDescription>
          Pre-filled purchase order draft for the selected supplier.
        </DialogDescription>
      </DialogHeader>

      {supplierEmails.length > 1 && (
        <div className="grid gap-2">
          <Label htmlFor="supplier">Supplier</Label>
          <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
            <SelectTrigger id="supplier" className="w-full">
              <SelectValue placeholder="Select a supplier" />
            </SelectTrigger>
            <SelectContent>
              {supplierEmails.map((email) => (
                <SelectItem key={email} value={email}>
                  {email} ({supplierGroups.get(email)?.length} item
                  {(supplierGroups.get(email)?.length ?? 0) > 1 ? "s" : ""})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {draft && (
        <div className="grid gap-2">
          <Label htmlFor="email-to">To</Label>
          <div
            id="email-to"
            className="rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm text-muted-foreground"
          >
            {selectedSupplier}
          </div>
          <Label htmlFor="email-subject">Subject</Label>
          <div
            id="email-subject"
            className="rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm"
          >
            {draft.subject}
          </div>
          <Label htmlFor="email-body">Body</Label>
          <Textarea
            id="email-body"
            readOnly
            value={draft.body}
            className="h-56 font-mono text-xs"
          />
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={handleCopy} disabled={!draft}>
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? "Copied" : "Copy to Clipboard"}
        </Button>
        <Button onClick={handleMailto} disabled={!draft}>
          <MailIcon />
          Open in Email Client
        </Button>
      </DialogFooter>
    </>
  )
}
