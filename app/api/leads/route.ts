import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { leadSchema } from "@/lib/validations"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = leadSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error.issues },
        { status: 400 }
      )
    }

    const lead = await db.lead.create({
      data: result.data,
    })

    return NextResponse.json({ success: true, id: lead.id })
  } catch (error) {
    console.error("Lead creation error:", error)
    return NextResponse.json(
      { error: "Erro ao salvar dados. Tente novamente." },
      { status: 500 }
    )
  }
}
