import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const threshold = new Date()
  threshold.setDate(threshold.getDate() - 7)

  const result = await db.salesConversation.updateMany({
    where: {
      lastMessageAt: { lt: threshold },
      stage: { notIn: ["PAGO", "AGUARDANDO_PAGAMENTO", "PERDIDO"] },
    },
    data: { stage: "PERDIDO" },
  })

  return NextResponse.json({ marked: result.count })
}
