"use client";

import { motion } from "framer-motion";

const steps = [
  {
    title: "Adquira sua licença",
    description:
      "Cadastre-se, pague a licença única e receba acesso imediato ao painel de licenciado.",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="14" r="4" />
        <path d="M11.5 11.5l8.5-8.5 M16 7l3 3 M14 9l3 3" />
      </svg>
    ),
  },
  {
    title: "Cadastre seus clientes",
    description:
      "Adicione seus clientes na plataforma e ofereça os serviços do portfólio com a sua marca.",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="8" r="4" />
        <path d="M2 21a8 8 0 0 1 16 0 M19 8v6 M22 11h-6" />
      </svg>
    ),
  },
  {
    title: "Faça pedidos pelo painel",
    description:
      "Solicite serviços com poucos cliques. Nossa equipe cuida da execução de ponta a ponta.",
    icon: (
      <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8 M8 12h8 M8 16h5" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="ds-section">
      <div className="ds-container">
        <motion.div
          className="ds-section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-eyebrow">04 · Simples e rápido</span>
          <h2>Como funciona? Em três passos.</h2>
          <p>
            Sem burocracia, sem treinamento longo. Você sai do cadastro com tudo no lugar
            pra atender o primeiro cliente no mesmo dia.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1080px] mx-auto pt-6">
          {steps.map((step, i) => (
            <motion.article
              key={step.title}
              className="ds-step"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <span className="ds-step-number">{i + 1}</span>
              <div className="ds-step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
