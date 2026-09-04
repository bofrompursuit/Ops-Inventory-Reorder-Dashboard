# Ops Inventory & Reorder Dashboard

A lightweight operations dashboard for tracking inventory levels, spotting low-stock SKUs, and generating supplier reorder emails — backed by Airtable.

Built with Next.js (App Router), Tailwind CSS, shadcn/ui, and the official [`airtable`](https://github.com/Airtable/airtable.js) JavaScript SDK.

## Features

- **Summary metrics**: total inventory value, total SKUs, and low-stock alert count.
- **Inventory table**: search by name/SKU, filter to low-stock only, sort any column, and see low-stock rows highlighted.
- **Quantity updates**: update a SKU's quantity on hand from a modal; the table updates optimistically and rolls back on failure.
- **Reorder email generator**: pre-filled purchase order email per supplier (grouped when a supplier carries multiple low-stock SKUs), with copy-to-clipboard and a `mailto:` shortcut. Available per-row and as a batch action across all low-stock items.
- **Demo Mode**: if Airtable isn't configured (or a request to it fails), the dashboard falls back to realistic sample data and shows a "Running in Demo Mode" banner instead of erroring out.

## Setting up the Airtable base

Create a base with a table (default name `Inventory`, configurable via `AIRTABLE_TABLE_NAME`) with these fields:

| Field Name          | Type                     |
| ------------------- | ------------------------ |
| `Item Name`         | Single line text         |
| `SKU`                | Single line text         |
| `Quantity`           | Number                   |
| `Reorder Threshold`  | Number                   |
| `Unit Price`         | Currency (or Number)     |
| `Supplier Email`     | Email                    |

Field names must match exactly (including spacing/casing) — the API layer in `lib/airtable.ts` maps these Airtable column names to the app's internal `InventoryItem` type.

## Environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable              | Description                                                                 |
| --------------------- | ----------------------------------------------------------------------------- |
| `AIRTABLE_API_KEY`     | A [personal access token](https://airtable.com/create/tokens) with `data.records:read` and `data.records:write` scopes on your base. |
| `AIRTABLE_BASE_ID`     | Your base ID, found in the base's API documentation (`airtable.com/appXXXXXXXXXXXXXX/...`). |
| `AIRTABLE_TABLE_NAME`  | Optional. Name of the inventory table. Defaults to `Inventory`.               |

If these variables are missing, or a request to Airtable fails at runtime, the app automatically falls back to bundled mock data and displays a "Running in Demo Mode" banner — the dashboard is always fully functional, even without Airtable configured.

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx                       # Main dashboard page (server component, fetches initial data)
  api/inventory/route.ts         # GET / POST / PATCH handlers backed by Airtable
components/
  dashboard/
    dashboard-shell.tsx          # Client-side state, data flow, and modal orchestration
    header.tsx, sidebar.tsx      # Dashboard chrome
    metric-cards.tsx             # Summary metric cards
    inventory-table.tsx          # Search, filter, sort, and low-stock highlighting
    update-quantity-modal.tsx    # Quantity update form
    reorder-email-modal.tsx      # Reorder email generator (single + batch)
    demo-mode-banner.tsx
    theme-toggle.tsx
  ui/                             # shadcn/ui primitives
lib/
  airtable.ts                    # Airtable client, field mapping, CRUD helpers, demo-mode fallback
  mock-data.ts                   # Sample inventory data used in Demo Mode
  email.ts                       # Reorder email draft generation
  types.ts                       # Shared InventoryItem types and derived calculations
  format.ts                      # Currency/number formatting helpers
```

## API

- `GET /api/inventory` — returns `{ items, demoMode, demoReason? }`.
- `POST /api/inventory` — creates an item. Body: `{ itemName, sku, quantity, reorderThreshold, unitPrice, supplierEmail }`.
- `PATCH /api/inventory` — updates a SKU's quantity. Body: `{ id, quantity }`.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [Tailwind CSS](https://tailwindcss.com) v4
- [shadcn/ui](https://ui.shadcn.com)
- [airtable](https://www.npmjs.com/package/airtable) (official JS SDK)
- [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- [sonner](https://sonner.emilkowal.ski) for toast notifications
