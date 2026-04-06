import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getSalesSystemPromptInfo, setSalesSystemPrompt } from "@/lib/app-settings"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) }
  }
  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (me?.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Sem permissão" }, { status: 403 }) }
  }
  return { error: null }
}

export async function GET() {
  const guard = await requireAdmin()
  if (guard.error) return guard.error
  const info = await getSalesSystemPromptInfo()
  return NextResponse.json(info)
}

const patchSchema = z.object({
  prompt: z.string().max(20000).nullable(),
})

export async function PATCH(req: Request) {
  const guard = await requireAdmin()
  if (guard.error) return guard.error
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
  }
  await setSalesSystemPrompt(parsed.data.prompt)
  const info = await getSalesSystemPromptInfo()
  return NextResponse.json(info)
}
