"use client";

import { motion } from "framer-motion";
import { CLOSER_WHATSAPP_URL } from "@/lib/pricing";

interface CtaFinalProps {
  whatsappUrl?: string;
}

export function CtaFinal({ whatsappUrl = CLOSER_WHATSAPP_URL }: CtaFinalProps = {}) {
  return (
    <section id="contact" className="ds-cta-final">
      <div className="ds-orb ds-orb--1" style={{ opacity: 0.4, top: "-200px", left: "-200px" }} />
      <div className="ds-orb ds-orb--2" style={{ opacity: 0.3, bottom: "-200px", right: "-100px" }} />

      <div className="ds-container">
        <div className="ds-cta-final-inner">
          <motion.span
            className="ds-eyebrow"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5 }}
          >
            Comece hoje
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            Pronto pra <span className="accent">vender mais</span>
            <br /> sem contratar mais?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            Sem taxa de entrada. Sem fidelidade. Sem burocracia. Fale com um especialista
            no WhatsApp e tire dúvidas direto com quem opera a plataforma.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex justify-center"
          >
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="ds-btn ds-btn--primary ds-btn--lg"
            >
              Falar com especialista
              <span className="arrow" aria-hidden>→</span>
            </a>
          </motion.div>

          <motion.div
            className="ds-cta-trust"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <span>Sem compromisso</span>
            <span>Suporte incluso</span>
            <span>Atendimento via WhatsApp</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
