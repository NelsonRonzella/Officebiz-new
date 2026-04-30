"use client";

import { motion } from "framer-motion";
import { CLOSER_WHATSAPP_URL, LICENSE_PRICE_LABEL } from "@/lib/pricing";

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
          <span className="ds-eyebrow">05 · Investimento único</span>
          <h2>Quanto custa? Menos do que você imagina.</h2>
          <p>
            Uma única licença, dois anos de acesso garantido. Hoje, com promoção,
            você leva três anos pelo mesmo preço.
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
            <p className="ds-price-eyebrow">Licença OfficeBiz</p>

            <p className="ds-price-amount">
              <span className="currency">R$</span>
              {LICENSE_PRICE_LABEL.replace(/^R\$\s*/, "")}
              <span className="period">único</span>
            </p>

            <div className="flex flex-col items-center gap-3 mb-2">
              <span
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
                style={{
                  background: "var(--ds-primary)",
                  color: "var(--ds-secondary-deep)",
                  boxShadow: "0 8px 22px rgba(185,232,72,.35)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                Promoção: 3 anos pelo preço de 2
              </span>
            </div>

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
              Pagamento único · Sem fidelidade · Cancele quando quiser
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
