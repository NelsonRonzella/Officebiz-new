import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendOtpEmail(email: string, code: string) {
  const { error } = await resend.emails.send({
    from: "OfficeBiz <noreply@officebiz.com.br>",
    to: email,
    subject: `Seu código de acesso: ${code}`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">OfficeBiz</h1>
        </div>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #64748B; font-size: 14px; margin: 0 0 8px;">Seu código de acesso:</p>
          <p style="color: #1E3A5F; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0 0 16px;">${code}</p>
          <p style="color: #64748B; font-size: 13px; margin: 0;">Este código expira em 10 minutos.</p>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Se você não solicitou este código, ignore este email.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error("Failed to send OTP email:", error)
    throw new Error("Failed to send verification email")
  }
}

export async function sendInviteEmail(email: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.officebiz.com.br"

  const { error } = await resend.emails.send({
    from: "OfficeBiz <noreply@officebiz.com.br>",
    to: email,
    subject: "Você foi convidado para a OfficeBiz",
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">OfficeBiz</h1>
        </div>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #1E3A5F; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
            Olá, ${name}!
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Você foi convidado para utilizar a plataforma OfficeBiz.
            Clique no botão abaixo para acessar sua conta.
          </p>
          <a
            href="${appUrl}/login"
            style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;"
          >
            Acessar OfficeBiz
          </a>
          <p style="color: #94A3B8; font-size: 13px; margin: 24px 0 0;">
            Seu email de acesso: <strong>${email}</strong>
          </p>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Se você não reconhece este convite, ignore este email.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error("Failed to send invite email:", error)
    throw new Error("Failed to send invite email")
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.officebiz.com.br"

  const { error } = await resend.emails.send({
    from: "OfficeBiz <noreply@officebiz.com.br>",
    to: email,
    subject: "Bem-vindo ao OfficeBiz!",
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">OfficeBiz</h1>
        </div>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #1E3A5F; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
            Bem-vindo${name ? `, ${name}` : ""}!
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
            Sua conta foi criada com sucesso na OfficeBiz.
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Você tem <strong>14 dias de período de teste</strong> para explorar
            todos os recursos da plataforma.
          </p>
          <a
            href="${appUrl}/app"
            style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;"
          >
            Acessar Dashboard
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Precisa de ajuda? Responda este email que entraremos em contato.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error("Failed to send welcome email:", error)
    throw new Error("Failed to send welcome email")
  }
}

interface OrderEmailInfo {
  clientName: string
  productName: string
  orderId: string
}

export async function sendOrderCreatedEmail(email: string, orderInfo: OrderEmailInfo) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.officebiz.com.br"

  const { error } = await resend.emails.send({
    from: "OfficeBiz <noreply@officebiz.com.br>",
    to: email,
    subject: `Novo pedido criado — ${orderInfo.productName}`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">OfficeBiz</h1>
        </div>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #1E3A5F; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
            Novo pedido criado
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
            Olá, ${orderInfo.clientName}!
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Seu pedido para <strong>${orderInfo.productName}</strong> foi criado
            com sucesso e está aguardando pagamento.
          </p>
          <a
            href="${appUrl}/app/pedidos/${orderInfo.orderId}"
            style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;"
          >
            Ver Pedido
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Você recebeu este email porque um pedido foi criado em sua conta.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error("Failed to send order created email:", error)
    throw new Error("Failed to send order created email")
  }
}

export async function sendOrderPaidEmail(email: string, orderInfo: OrderEmailInfo) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.officebiz.com.br"

  const { error } = await resend.emails.send({
    from: "OfficeBiz <noreply@officebiz.com.br>",
    to: email,
    subject: `Pagamento confirmado — ${orderInfo.productName}`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">OfficeBiz</h1>
        </div>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #1E3A5F; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
            Pagamento confirmado
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
            Olá, ${orderInfo.clientName}!
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            O pagamento do seu pedido para <strong>${orderInfo.productName}</strong>
            foi confirmado. O serviço será iniciado em breve.
          </p>
          <a
            href="${appUrl}/app/pedidos/${orderInfo.orderId}"
            style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;"
          >
            Ver Pedido
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Você recebeu este email porque seu pagamento foi processado.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error("Failed to send order paid email:", error)
    throw new Error("Failed to send order paid email")
  }
}

export async function sendOrderCompletedEmail(email: string, orderInfo: OrderEmailInfo) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.officebiz.com.br"

  const { error } = await resend.emails.send({
    from: "OfficeBiz <noreply@officebiz.com.br>",
    to: email,
    subject: `Pedido concluído — ${orderInfo.productName}`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">OfficeBiz</h1>
        </div>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #1E3A5F; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
            Pedido concluído
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
            Olá, ${orderInfo.clientName}!
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            O serviço para <strong>${orderInfo.productName}</strong> foi concluído
            com sucesso. Obrigado por utilizar a OfficeBiz!
          </p>
          <a
            href="${appUrl}/app/pedidos/${orderInfo.orderId}"
            style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;"
          >
            Ver Pedido
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Obrigado por confiar na OfficeBiz.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error("Failed to send order completed email:", error)
    throw new Error("Failed to send order completed email")
  }
}

export async function sendTrialExpiringEmail(email: string, name: string, daysLeft: number) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.officebiz.com.br"

  const { error } = await resend.emails.send({
    from: "OfficeBiz <noreply@officebiz.com.br>",
    to: email,
    subject: `Seu período de teste expira em ${daysLeft} dias`,
    html: `
      <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #1E3A5F; font-size: 24px; margin: 0;">OfficeBiz</h1>
        </div>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 32px; text-align: center;">
          <p style="color: #1E3A5F; font-size: 18px; font-weight: 600; margin: 0 0 16px;">
            Seu teste está acabando
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
            Olá${name ? `, ${name}` : ""}!
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 8px;">
            Seu período de teste expira em <strong>${daysLeft} dia${daysLeft !== 1 ? "s" : ""}</strong>.
          </p>
          <p style="color: #64748B; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Assine o plano PRO para continuar utilizando todos os recursos
            da plataforma sem interrupções.
          </p>
          <a
            href="${appUrl}/app/configuracoes"
            style="display: inline-block; background: #1E3A5F; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;"
          >
            Assinar Plano PRO
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Dúvidas sobre o plano? Responda este email.
        </p>
      </div>
    `,
  })

  if (error) {
    console.error("Failed to send trial expiring email:", error)
    throw new Error("Failed to send trial expiring email")
  }
}

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
