"use client";

import { motion } from "framer-motion";

const steps = [
  {
    label: "Licenciado",
    sub: "Você capta clientes e gerencia pedidos pelo painel",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </svg>
    ),
  },
  {
    label: "Plataforma",
    sub: "Sistema completo conecta você à equipe",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8 M12 17v4" />
      </svg>
    ),
  },
  {
    label: "Especialistas",
    sub: "Contadores, designers e devs executam cada serviço",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.5" />
        <circle cx="17" cy="9" r="3" />
        <path d="M3 21a6 6 0 0 1 12 0 M14 21a5 5 0 0 1 8 0" />
      </svg>
    ),
  },
  {
    label: "Cliente final",
    sub: "Recebe o serviço entregue com a sua marca",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21h18 M5 21V8l7-4 7 4v13 M9 21v-6h6v6" />
      </svg>
    ),
  },
];

export function WhatIs() {
  return (
    <section id="what-is" className="ds-section">
      <div className="ds-container">
        <motion.div
          className="ds-section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-eyebrow">01 · Como tudo se conecta</span>
          <h2>O que é a OfficeBiz?</h2>
          <p>
            Uma plataforma white-label que permite a qualquer pessoa oferecer serviços empresariais
            completos — sem precisar montar equipe própria. Você gerencia seus clientes, nós cuidamos
            da execução.
          </p>
        </motion.div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-[1080px] mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              className="ds-mini-card relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="ds-mini-card-icon">{step.icon}</div>
              <h3 className="ds-mini-card-title">{step.label}</h3>
              <p className="ds-mini-card-text">{step.sub}</p>
              <div
                aria-hidden
                className="absolute top-5 right-5 text-[11px] font-mono font-semibold tracking-widest"
                style={{ color: "var(--ds-primary-deep)" }}
              >
                0{i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
