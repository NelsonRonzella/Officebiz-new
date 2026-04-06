// lib/pricing.ts
export const LICENSE_PRICE_CENTS = 299000 // R$ 2.990,00
export const LICENSE_PRICE_LABEL = "R$ 2.990"
export const CONTRACT_DURATION_OPTIONS = [24, 36] as const
export type ContractDurationMonths = typeof CONTRACT_DURATION_OPTIONS[number]
export const DEFAULT_CONTRACT_MONTHS: ContractDurationMonths = 24
export const TRIAL_DURATION_DAYS = 7

/**
 * @deprecated Static fallback only. Prefer
 * `getConnectedWhatsappNumber()` from `lib/evolution-instance.ts`, which reads
 * the live number from the connected Evolution API instance.
 */
export const CLOSER_WHATSAPP = "5517997014926"
/**
 * @deprecated Static fallback only. Prefer
 * `getConnectedWhatsappUrl()` from `lib/evolution-instance.ts`.
 */
export const CLOSER_WHATSAPP_URL = `https://wa.me/${CLOSER_WHATSAPP}?text=${encodeURIComponent(
  "Olá, quero saber mais sobre o OfficeBiz"
)}`

export const CONTRACT_EXPIRY_WARNING_DAYS = [30, 15, 7] as const
