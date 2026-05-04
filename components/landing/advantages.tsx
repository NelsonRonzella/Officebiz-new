"use client";

import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Users, Boxes, BadgeCheck, MessageCircle } from "lucide-react";

const advantages = [
  {
    title: "Zero investimento",
    description:
      "Sem taxa de licença, sem setup, sem treinamento. Comece sem gastar nada além da mensalidade.",
    icon: <DollarSign size={22} strokeWidth={2} />,
  },
  {
    title: "Ganhe em cada venda",
    description:
      "Defina suas próprias margens. Quanto mais vende, mais lucra — sem teto, sem repasse forçado.",
    icon: <TrendingUp size={22} strokeWidth={2} />,
  },
  {
    title: "Equipe inclusa",
    description:
      "Contadores, designers, desenvolvedores — todos prontos pra executar. Você não contrata ninguém.",
    icon: <Users size={22} strokeWidth={2} />,
  },
  {
    title: "Escalável",
    description:
      "Atenda 1 ou 1.000 clientes. A plataforma cresce com você sem precisar refazer nada.",
    icon: <Boxes size={22} strokeWidth={2} />,
  },
  {
    title: "White-label",
    description:
      "Ofereça tudo com a sua marca. Seus clientes nem sabem que existimos nos bastidores.",
    icon: <BadgeCheck size={22} strokeWidth={2} />,
  },
  {
    title: "Suporte dedicado",
    description:
      "Canal direto via WhatsApp pra dúvidas, acompanhamento de pedidos e novidades da plataforma.",
    icon: <MessageCircle size={22} strokeWidth={2} />,
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
          <span className="ds-eyebrow">05 · Vantagens</span>
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
