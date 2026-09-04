import { InfoIcon } from "lucide-react"

export function DemoModeBanner({ reason }: { reason?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
      <InfoIcon className="mt-0.5 size-4 shrink-0" />
      <div>
        <p className="font-medium">Running in Demo Mode</p>
        <p className="text-amber-700/80 dark:text-amber-400/80">
          {reason ??
            "Airtable is not configured, so sample inventory data is shown."}{" "}
          Set <code className="font-mono">AIRTABLE_API_KEY</code> and{" "}
          <code className="font-mono">AIRTABLE_BASE_ID</code> to connect your
          live base.
        </p>
      </div>
    </div>
  )
}
