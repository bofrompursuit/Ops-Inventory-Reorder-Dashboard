"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

function subscribeNoop() {
  return () => {}
}

// Avoids a hydration mismatch (server never knows the resolved theme) without
// setting state from an effect: the client snapshot flips to true post-mount.
function useHasMounted() {
  return React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  )
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const hasMounted = useHasMounted()

  if (!hasMounted) {
    return <Button variant="outline" size="icon" aria-hidden />
  }

  const isDark = resolvedTheme === "dark"

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
