import Image from "next/image"
import { ArrowUpRightIcon } from "lucide-react"

const VENMO_URL = "https://venmo.com/u/beau_moldenhauer"
const PORTFOLIO_URL = "https://bob2bsolutionsarchitect.vercel.app/"

export function SiteFooter({ demoMode }: { demoMode: boolean }) {
  return (
    <footer className="border-t border-border px-4 py-5 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <a
          href={VENMO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex min-w-0 items-center gap-3"
        >
          {/* White tile keeps the QR scannable in dark mode. */}
          <span className="shrink-0 rounded-lg bg-white p-1 ring-1 ring-border transition-shadow group-hover:shadow-sm">
            <Image
              src="/venmo-qr.svg"
              alt="QR code linking to Venmo @beau_moldenhauer"
              width={64}
              height={64}
              unoptimized
              className="size-16 [image-rendering:pixelated]"
            />
          </span>
          <span className="min-w-0 max-w-xs text-sm text-muted-foreground">
            Donate to my SMB &amp; my future apps through Venmo:{" "}
            <span className="font-medium text-foreground group-hover:underline">
              @beau_moldenhauer
            </span>
          </span>
        </a>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:items-end">
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
          >
            bob2bsolutionsarchitect.vercel.app
            <ArrowUpRightIcon className="size-3.5" />
          </a>
          <p>
            Ops Inventory · Reorder copilot MVP ·{" "}
            {demoMode ? "Demo data" : "Live data"}
          </p>
        </div>
      </div>
    </footer>
  )
}
