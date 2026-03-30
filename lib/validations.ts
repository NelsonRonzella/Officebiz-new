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
  companyName: z.string().min(2, "Nome da empresa deve ter pelo menos 2 caracteres"),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().min(10, "WhatsApp deve ter pelo menos 10 dígitos").optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})

export type LeadInput = z.infer<typeof leadSchema>
export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>
export const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Email inválido"),
  role: z.enum(["ADMIN", "LICENCIADO", "PRESTADOR", "CLIENTE"]),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  telefone: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
})

export const updateUserSchema = createUserSchema.partial().omit({ role: true })

export const createClientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Email inválido"),
  telefone: z.string().optional(),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
})

export type ProfileInput = z.infer<typeof profileSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateClientInput = z.infer<typeof createClientSchema>
