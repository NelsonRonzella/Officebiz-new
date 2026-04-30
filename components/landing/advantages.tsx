"use client";

import { motion } from "framer-motion";

const advantages = [
  {
    title: "Zero investimento",
    description:
      "Sem taxa de licença, sem setup, sem treinamento. Comece sem gastar nada além da mensalidade.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20 M17 6H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H7" />
      </svg>
    ),
  },
  {
    title: "Ganhe em cada venda",
    description:
      "Defina suas próprias margens. Quanto mais vende, mais lucra — sem teto, sem repasse forçado.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17l6-6 4 4 8-8 M21 7v6 M21 7h-6" />
      </svg>
    ),
  },
  {
    title: "Equipe inclusa",
    description:
      "Contadores, designers, desenvolvedores — todos prontos pra executar. Você não contrata ninguém.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M3 20a6 6 0 0 1 12 0 M14 20a5 5 0 0 1 8 0" />
      </svg>
    ),
  },
  {
    title: "Escalável",
    description:
      "Atenda 1 ou 1.000 clientes. A plataforma cresce com você sem precisar refazer nada.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 L4 7 V17 L12 22 L20 17 V7 Z M12 2 V22 M4 7 L20 17 M20 7 L4 17" />
      </svg>
    ),
  },
  {
    title: "White-label",
    description:
      "Ofereça tudo com a sua marca. Seus clientes nem sabem que existimos nos bastidores.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7L9 18l-5-5" />
      </svg>
    ),
  },
  {
    title: "Suporte dedicado",
    description:
      "Canal direto via WhatsApp pra dúvidas, acompanhamento de pedidos e novidades da plataforma.",
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 4V5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    ),
  },
];

export function Advantages() {
  return (
    <section id="advantages" className="ds-section ds-section--dark">
      <div className="ds-orb ds-orb--3" style={{ top: "10%", left: "10%" }} />
      <div className="ds-orb ds-orb--1" style={{ bottom: "-160px", right: "-100px", opacity: 0.5 }} />

      <div className="ds-container relative z-10">
        <motion.div
          className="ds-section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-eyebrow">04 · Vantagens</span>
          <h2>Por que ser um licenciado OfficeBiz?</h2>
          <p>
            Você ganha estrutura de uma operação grande sem precisar montar uma — e mantém
            controle total sobre marca, preço e relacionamento com o cliente.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {advantages.map((item, i) => (
            <motion.article
              key={item.title}
              className="ds-mini-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
            >
              <div className="ds-mini-card-icon">{item.icon}</div>
              <h3 className="ds-mini-card-title">{item.title}</h3>
              <p className="ds-mini-card-text">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
