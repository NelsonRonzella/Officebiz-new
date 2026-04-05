import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateOtp, sendOtpEmail } from "@/lib/email"
import { sendText } from "@/lib/whatsapp"

export async function POST(req: Request) {
  try {
    const { email, channel } = await req.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email é obrigatório" },
        { status: 400 }
      )
    }

    // Check if user exists and get phone
    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, telefone: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Este e-mail não está cadastrado." },
        { status: 404 }
      )
    }

    if (channel === "whatsapp" && !user.telefone) {
      return NextResponse.json(
        { error: "Nenhum telefone cadastrado para este e-mail." },
        { status: 400 }
      )
    }

    // Rate limiting: max 5 attempts per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentTokens = await db.verificationToken.count({
      where: {
        identifier: email,
        expires: { gt: oneHourAgo },
      },
    })

    if (recentTokens >= 5) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde antes de tentar novamente." },
        { status: 429 }
      )
    }

    const code = generateOtp()
    const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    await db.verificationToken.create({
      data: {
        identifier: email,
        token: code,
        expires,
      },
    })

    if (channel === "whatsapp" && user.telefone) {
      const phone = "55" + user.telefone.replace(/\D/g, "")
      const msg = [
        "🔐 *OfficeBiz* — Código de acesso",
        "",
        `Seu código: *${code}*`,
        "",
        "Válido por 10 minutos. Não compartilhe este código.",
      ].join("\n")
      await sendText(phone, msg)
    } else {
      await sendOtpEmail(email, code)
    }

    return NextResponse.json({ success: true, hasPhone: !!user.telefone })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json(
      { error: "Erro ao enviar código. Tente novamente." },
      { status: 500 }
    )
  }
}
