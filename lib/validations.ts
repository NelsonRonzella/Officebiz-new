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
export const productStepSchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().min(5, "Descrição obrigatória"),
  durationDays: z.number().int().positive("Prazo deve ser positivo"),
  order: z.number().int().min(0),
})

export const productCategorySchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().min(5, "Descrição obrigatória"),
  order: z.number().int().min(0),
})

export const productBaseSchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  price: z.number().positive("Preço deve ser positivo"),
})

export const pontualProductSchema = productBaseSchema.extend({
  type: z.literal("PONTUAL"),
  steps: z.array(productStepSchema).min(1, "Mínimo 1 etapa"),
  tutorialIds: z.array(z.string()).optional(),
})

export const recorrenteProductSchema = productBaseSchema.extend({
  type: z.literal("RECORRENTE"),
  categories: z.array(productCategorySchema).min(1, "Mínimo 1 categoria"),
  tutorialIds: z.array(z.string()).optional(),
})

export const createProductSchema = z.union([pontualProductSchema, recorrenteProductSchema])

export const tutorialSchema = z.object({
  title: z.string().min(2, "Título obrigatório"),
  description: z.string().min(5, "Descrição obrigatória"),
  link: z.string().url("Link inválido"),
  productIds: z.array(z.string()).optional(),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type PontualProductInput = z.infer<typeof pontualProductSchema>
export type RecorrenteProductInput = z.infer<typeof recorrenteProductSchema>
export type TutorialInput = z.infer<typeof tutorialSchema>
