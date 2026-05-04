"use client";

import { motion } from "framer-motion";
import { User, Monitor, Users, Building2 } from "lucide-react";

const steps = [
  {
    label: "Licenciado",
    sub: "Você capta clientes e gerencia pedidos pelo painel",
    icon: <User size={22} strokeWidth={2} />,
  },
  {
    label: "Plataforma",
    sub: "Sistema completo conecta você à equipe",
    icon: <Monitor size={22} strokeWidth={2} />,
  },
  {
    label: "Especialistas",
    sub: "Contadores, designers e devs executam cada serviço",
    icon: <Users size={22} strokeWidth={2} />,
  },
  {
    label: "Cliente final",
    sub: "Recebe o serviço entregue com a sua marca",
    icon: <Building2 size={22} strokeWidth={2} />,
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
