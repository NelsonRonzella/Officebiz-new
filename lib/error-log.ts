import { db } from "@/lib/db"
import type { SystemErrorSource, SystemErrorSeverity } from "@prisma/client"

interface LogErrorInput {
  source: SystemErrorSource
  message: string
  context?: Record<string, unknown>
  severity?: SystemErrorSeverity
}

// Grava erro no banco para exibição no admin e também no console.
// Nunca lança — falhas de log não devem mascarar o erro original.
export async function logError({
  source,
  message,
  context,
  severity = "ERROR",
}: LogErrorInput): Promise<void> {
  console.error(`[${source}] ${message}`, context ?? "")
  try {
    await db.systemError.create({
      data: {
        source,
        severity,
        message: message.slice(0, 2000),
        context: context ? (JSON.parse(JSON.stringify(context)) as object) : undefined,
      },
    })
  } catch (err) {
    console.error("[error-log] failed to persist error:", err)
  }
}
