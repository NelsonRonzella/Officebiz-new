import { NextRequest, NextResponse } from "next/server"
import { checkAndExpireTrials } from "@/lib/subscription"

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization")

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  try {
    const expired = await checkAndExpireTrials()
    return NextResponse.json({ expired })
  } catch (error) {
    console.error("Cron expire-trials error:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}
