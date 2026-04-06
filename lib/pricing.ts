// lib/pricing.ts
export const LICENSE_PRICE_CENTS = 299000 // R$ 2.990,00
export const LICENSE_PRICE_LABEL = "R$ 2.990"
export const CONTRACT_DURATION_OPTIONS = [24, 36] as const
export type ContractDurationMonths = typeof CONTRACT_DURATION_OPTIONS[number]
export const DEFAULT_CONTRACT_MONTHS: ContractDurationMonths = 24
export const TRIAL_DURATION_DAYS = 7

export const CLOSER_WHATSAPP = "5517997014962"
export const CLOSER_WHATSAPP_URL = `https://wa.me/${CLOSER_WHATSAPP}?text=${encodeURIComponent(
  "Olá, quero saber mais sobre o OfficeBiz"
)}`

export const CONTRACT_EXPIRY_WARNING_DAYS = [30, 15, 7] as const
