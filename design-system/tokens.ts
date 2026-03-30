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
    background: "0 0% 100%",           // #FFFFFF
    foreground: "222 47% 11%",          // #0F172A
    card: "0 0% 100%",                  // #FFFFFF
    cardForeground: "222 47% 11%",      // #0F172A
    popover: "0 0% 100%",              // #FFFFFF
    popoverForeground: "222 47% 11%",   // #0F172A
    primary: "213 52% 24%",             // #1E3A5F (Navy Blue)
    primaryForeground: "0 0% 100%",     // #FFFFFF
    secondary: "210 40% 96%",           // #F1F5F9
    secondaryForeground: "222 47% 11%", // #0F172A
    muted: "210 40% 96%",              // #F1F5F9
    mutedForeground: "215 16% 47%",     // #64748B
    accent: "142 71% 45%",             // #22C55E (Green)
    accentForeground: "0 0% 100%",      // #FFFFFF
    destructive: "0 84% 60%",          // #EF4444
    destructiveForeground: "0 0% 100%", // #FFFFFF
    border: "214 32% 91%",             // #E2E8F0
    input: "214 32% 91%",              // #E2E8F0
    ring: "213 52% 24%",               // #1E3A5F
    // Custom OfficeBiz
    success: "142 71% 45%",            // #22C55E
    successForeground: "0 0% 100%",     // #FFFFFF
    warning: "38 92% 50%",             // #F59E0B
    warningForeground: "0 0% 100%",     // #FFFFFF
    surface: "210 40% 98%",            // #F8FAFC
    surfaceForeground: "222 47% 11%",   // #0F172A
  },
  sidebar: {
    background: "216 50% 16%",          // #0F2439 (Navy Dark)
    foreground: "210 40% 96%",          // #F1F5F9
    primary: "142 71% 45%",            // #22C55E
    primaryForeground: "0 0% 100%",     // #FFFFFF
    accent: "213 52% 30%",             // #1E4A7F
    accentForeground: "210 40% 96%",    // #F1F5F9
    border: "213 40% 25%",             // #1A3555
    ring: "142 71% 45%",               // #22C55E
  },
  radius: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
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
