"use client";

import { motion } from "framer-motion";
import { FileSignature, UserPlus, ClipboardList } from "lucide-react";

const steps = [
  {
    title: "Adquira sua licença",
    description:
      "Cadastre-se, pague a licença única e receba acesso imediato ao painel de licenciado.",
    icon: <FileSignature size={26} strokeWidth={2} />,
  },
  {
    title: "Cadastre seus clientes",
    description:
      "Adicione seus clientes na plataforma e ofereça os serviços do portfólio com a sua marca.",
    icon: <UserPlus size={26} strokeWidth={2} />,
  },
  {
    title: "Faça pedidos pelo painel",
    description:
      "Solicite serviços com poucos cliques. Nossa equipe cuida da execução de ponta a ponta.",
    icon: <ClipboardList size={26} strokeWidth={2} />,
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
