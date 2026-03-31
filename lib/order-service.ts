import { db } from "./db"

export async function createOrderSteps(orderId: string, productId: string) {
  const productSteps = await db.productStep.findMany({
    where: { productId },
    orderBy: { order: "asc" },
  })

  for (const step of productSteps) {
    await db.orderStep.create({
      data: {
        orderId,
        title: step.title,
        description: step.description,
        order: step.order,
        durationDays: step.durationDays,
      },
    })
  }
}

export async function createOrderCategories(orderId: string, productId: string) {
  const categories = await db.productDocumentCategory.findMany({
    where: { productId },
    orderBy: { order: "asc" },
  })

  for (const cat of categories) {
    await db.orderDocumentCategory.create({
      data: {
        orderId,
        title: cat.title,
        description: cat.description,
        order: cat.order,
      },
    })
  }
}

export async function startFirstStep(orderId: string) {
  const firstStep = await db.orderStep.findFirst({
    where: { orderId },
    orderBy: { order: "asc" },
  })

  if (!firstStep) return

  await db.orderStep.update({
    where: { id: firstStep.id },
    data: { startedAt: new Date() },
  })

  await db.order.update({
    where: { id: orderId },
    data: { currentStepId: firstStep.id },
  })
}

export async function advanceStep(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      steps: { orderBy: { order: "asc" } },
      currentStep: true,
    },
  })

  if (!order || !order.currentStep) return null

  // Finish current step
  await db.orderStep.update({
    where: { id: order.currentStep.id },
    data: { finishedAt: new Date() },
  })

  // Find next step
  const currentIdx = order.steps.findIndex((s) => s.id === order.currentStep!.id)
  const nextStep = order.steps[currentIdx + 1]

  if (nextStep) {
    // Start next step
    await db.orderStep.update({
      where: { id: nextStep.id },
      data: { startedAt: new Date() },
    })

    await db.order.update({
      where: { id: orderId },
      data: { currentStepId: nextStep.id },
    })
  } else {
    // No more steps — clear currentStep
    await db.order.update({
      where: { id: orderId },
      data: { currentStepId: null },
    })
  }

  // Recalculate progress
  await recalculateProgress(orderId)

  return nextStep || null
}

export async function recalculateProgress(orderId: string) {
  const steps = await db.orderStep.findMany({
    where: { orderId },
  })

  if (steps.length === 0) return

  const finished = steps.filter((s) => s.finishedAt !== null).length
  const progress = Math.round((finished / steps.length) * 100)

  await db.order.update({
    where: { id: orderId },
    data: { progresso: progress },
  })
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
    EM_ANDAMENTO: "Em Andamento",
    CANCELADO: "Cancelado",
    RETORNO: "Retorno",
    PAGO: "Pago",
    CONCLUIDO: "Concluído",
  }
  return labels[status] || status
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    AGUARDANDO_PAGAMENTO: "bg-yellow-100 text-yellow-800 border-yellow-300",
    EM_ANDAMENTO: "bg-blue-100 text-blue-800 border-blue-300",
    CANCELADO: "bg-red-100 text-red-800 border-red-300",
    RETORNO: "bg-cyan-100 text-cyan-800 border-cyan-300",
    PAGO: "bg-emerald-100 text-emerald-800 border-emerald-300",
    CONCLUIDO: "bg-green-100 text-green-800 border-green-300",
  }
  return colors[status] || "bg-gray-100 text-gray-800"
}
