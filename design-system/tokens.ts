export interface DesignTokens {
  colors: {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    destructiveForeground: string
    border: string
    input: string
    ring: string
    // Custom OfficeBiz tokens
    success: string
    successForeground: string
    warning: string
    warningForeground: string
    surface: string
    surfaceForeground: string
  }
  sidebar: {
    background: string
    foreground: string
    primary: string
    primaryForeground: string
    accent: string
    accentForeground: string
    border: string
    ring: string
  }
  radius: {
    sm: string
    md: string
    lg: string
    xl: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    "2xl": string
    "3xl": string
  }
  typography: {
    fontFamily: string
    fontFamilyMono: string
    sizes: {
      xs: string
      sm: string
      base: string
      lg: string
      xl: string
      "2xl": string
      "3xl": string
      "4xl": string
      "5xl": string
      "6xl": string
    }
  }
}

export const tokens: DesignTokens = {
  colors: {
    background: "#ffffff",
    foreground: "#0a0a0a",
    card: "#ffffff",
    cardForeground: "#0a0a0a",
    popover: "#ffffff",
    popoverForeground: "#0a0a0a",
    primary: "#171717",
    primaryForeground: "#fafafa",
    secondary: "#f5f5f5",
    secondaryForeground: "#171717",
    muted: "#f5f5f5",
    mutedForeground: "#737373",
    accent: "#f5f5f5",
    accentForeground: "#171717",
    destructive: "#e40014",
    destructiveForeground: "#fef2f2",
    border: "#e5e5e5",
    input: "#e5e5e5",
    ring: "#a1a1a1",
    // Custom OfficeBiz
    success: "#16a34a",
    successForeground: "#ffffff",
    warning: "#d97706",
    warningForeground: "#ffffff",
    surface: "#f8f8f8",
    surfaceForeground: "#0a0a0a",
  },
  sidebar: {
    background: "#fafafa",
    foreground: "#0a0a0a",
    primary: "#171717",
    primaryForeground: "#fafafa",
    accent: "#f5f5f5",
    accentForeground: "#171717",
    border: "#e5e5e5",
    ring: "#a1a1a1",
  },
  radius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.625rem",
    xl: "1rem",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
    "2xl": "3rem",
    "3xl": "4rem",
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, sans-serif",
    fontFamilyMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, monospace",
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
    },
  },
}
