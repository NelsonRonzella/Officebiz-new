"use client";

import { motion } from "framer-motion";
import { CLOSER_WHATSAPP_URL } from "@/lib/pricing";

interface PricingProps {
  whatsappUrl?: string;
}

const includedItems = [
  "Plataforma completa de gestão",
  "Equipe de especialistas inclusa",
  "Suporte dedicado via WhatsApp",
  "Marca própria (white-label)",
  "Treinamento e materiais de apoio",
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12 L10 17 L19 7" />
    </svg>
  );
}

export function Pricing({ whatsappUrl = CLOSER_WHATSAPP_URL }: PricingProps = {}) {
  return (
    <section id="pricing" className="ds-section ds-section--alt">
      <div className="ds-container">
        <motion.div
          className="ds-section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-eyebrow">06 · Investimento</span>
          <h2>Quanto custa? Menos do que você imagina.</h2>
          <p>
            Uma única licença OfficeBiz, um ano de acesso completo à plataforma e
            à equipe de especialistas.
          </p>
        </motion.div>

        <motion.div
          className="ds-price-card"
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="ds-price-card-inner">
            <div className="flex justify-center mb-4">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
                style={{
                  background: "var(--ds-primary)",
                  color: "var(--ds-secondary-deep)",
                  boxShadow: "0 8px 22px rgba(185,232,72,.35)",
                  letterSpacing: ".08em",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Parcele em 12×
              </span>
            </div>

            <p className="ds-price-eyebrow">Licença OfficeBiz</p>

            <p className="ds-price-amount">
              <span className="installments-label">12×</span>
              <span className="currency">R$</span>
              <span className="installment-value">299</span>
              <span className="cents">,00</span>
            </p>

            <p
              className="text-center text-sm mt-3 mb-1"
              style={{ color: "var(--ds-text-muted)" }}
            >
              ou{" "}
              <strong style={{ color: "var(--ds-secondary)", fontWeight: 700 }}>
                R$ 2.990,00 à vista
              </strong>
            </p>

            <p
              className="text-center text-xs mt-2 mb-6"
              style={{ color: "var(--ds-text-muted)" }}
            >
              1 ano de acesso completo
            </p>

            <ul className="ds-price-features">
              {includedItems.map((item) => (
                <li key={item}>
                  <span className="check"><CheckIcon /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="ds-btn ds-btn--primary ds-btn--lg w-full justify-center"
            >
              Falar com especialista
              <span className="arrow" aria-hidden>→</span>
            </a>

            <p
              className="text-center text-xs mt-4"
              style={{ color: "var(--ds-text-muted)" }}
            >
              Compra segura com Stripe
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
