/**
 * Converts a camelCase token key to a CSS custom property name.
 * Example: "cardForeground" → "--card-foreground"
 */
export function tokenKeyToCssVar(key: string): string {
  const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase()
  return `--${kebab}`
}

/**
 * Converts a sidebar token key to a CSS custom property name.
 * Example: "primary" → "--sidebar-primary"
 */
export function sidebarKeyToCssVar(key: string): string {
  if (key === "background") return "--sidebar"
  const kebab = key.replace(/([A-Z])/g, "-$1").toLowerCase()
  return `--sidebar-${kebab}`
}
