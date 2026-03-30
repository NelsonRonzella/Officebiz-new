import { readFileSync, writeFileSync } from "fs"
import { resolve } from "path"
import { tokens } from "./tokens"
import { tokenKeyToCssVar, sidebarKeyToCssVar } from "./utils"

const GLOBALS_PATH = resolve(__dirname, "../app/globals.css")
const START_MARKER = "/* === DESIGN TOKENS START === */"
const END_MARKER = "/* === DESIGN TOKENS END === */"

function generateCssVars(): string {
  const lines: string[] = []

  lines.push("  :root {")

  // Color tokens
  for (const [key, value] of Object.entries(tokens.colors)) {
    lines.push(`    ${tokenKeyToCssVar(key)}: ${value};`)
  }

  lines.push("")

  // Sidebar tokens
  for (const [key, value] of Object.entries(tokens.sidebar)) {
    lines.push(`    ${sidebarKeyToCssVar(key)}: ${value};`)
  }

  lines.push("")

  // Radius
  lines.push(`    --radius: ${tokens.radius.lg};`)

  lines.push("  }")

  return lines.join("\n")
}

function main() {
  const isCheck = process.argv.includes("--check")

  const css = readFileSync(GLOBALS_PATH, "utf-8")
  const generated = generateCssVars()

  const startIdx = css.indexOf(START_MARKER)
  const endIdx = css.indexOf(END_MARKER)

  let newCss: string

  if (startIdx !== -1 && endIdx !== -1) {
    // Replace between markers
    newCss =
      css.slice(0, startIdx + START_MARKER.length) +
      "\n" +
      generated +
      "\n" +
      css.slice(endIdx)
  } else {
    // Insert markers + tokens before the first @layer or at end
    const layerIdx = css.indexOf("@layer")
    const block = `${START_MARKER}\n${generated}\n${END_MARKER}\n\n`

    if (layerIdx !== -1) {
      newCss = css.slice(0, layerIdx) + block + css.slice(layerIdx)
    } else {
      newCss = css + "\n" + block
    }
  }

  if (isCheck) {
    if (newCss !== css) {
      console.error("❌ globals.css is out of sync with design-system/tokens.ts")
      console.error("   Run `npm run tokens` to regenerate.")
      process.exit(1)
    }
    console.log("✅ globals.css is in sync with design tokens.")
    return
  }

  writeFileSync(GLOBALS_PATH, newCss, "utf-8")
  console.log("✅ Design tokens generated in globals.css")
}

main()
