import { z } from "zod/v4"

export const leadSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Email inválido"),
  phone: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
  source: z.string().optional(),
})

export const onboardingStep1Schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
})

export const onboardingStep2Schema = z.object({
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  companyLogo: z.string().optional(),
})

export const profileSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos"),
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
})

export type LeadInput = z.infer<typeof leadSchema>
export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>
export type ProfileInput = z.infer<typeof profileSchema>
