"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const services = [
  {
    title: "Abertura de CNPJ",
    description: "MEI, ME, EPP — todo o processo de formalização empresarial simplificado.",
    icon: "/landing/images/icon-folder.svg",
  },
  {
    title: "Contabilidade",
    description: "Escrituração, impostos, folha de pagamento e obrigações acessórias.",
    icon: "/landing/images/icon-card.svg",
    comingSoon: true,
  },
  {
    title: "Seguros",
    description: "Seguros empresariais e de vida — você oferece proteção completa pros seus clientes com a sua marca.",
    icon: "/landing/images/icon-shield.svg",
    comingSoon: true,
  },
  {
    title: "Registro de Marca",
    description: "Pesquisa de anterioridade e registro junto ao INPI com acompanhamento.",
    icon: "/landing/images/icon-shield.svg",
  },
  {
    title: "Logotipos",
    description: "Criação de identidade visual profissional com manual de marca.",
    icon: "/landing/images/icon-language.svg",
  },
  {
    title: "Papelaria",
    description: "Cartões de visita, papel timbrado, envelopes e materiais impressos.",
    icon: "/landing/images/icon-folder.svg",
  },
  {
    title: "Sites",
    description: "Sites institucionais e landing pages otimizadas para conversão.",
    icon: "/landing/images/icon-computer.svg",
  },
  {
    title: "E-mail e Domínios",
    description: "Registro de domínio e configuração de e-mail profissional.",
    icon: "/landing/images/icon-language.svg",
  },
  {
    title: "Cartão Virtual",
    description: "Cartão de visita digital interativo com QR Code e link compartilhável.",
    icon: "/landing/images/icon-card.svg",
  },
];

export function Services() {
  return (
    <section id="services" className="ds-section ds-section--alt">
      <div className="ds-container">
        <motion.div
          className="ds-section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-eyebrow">02 · Portfólio completo</span>
          <h2>Serviços que você pode oferecer aos seus clientes</h2>
          <p>
            Um portfólio inteiro pronto pra revenda. Sem precisar de equipe própria,
            sem precisar saber executar — basta vender com a sua marca.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.06 }}
            >
              <article className="ds-card h-full flex flex-col gap-4 relative">
                {service.comingSoon && (
                  <span
                    className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: "rgba(185,232,72,.18)",
                      color: "var(--ds-primary-deep)",
                      letterSpacing: ".08em",
                    }}
                  >
                    Em breve
                  </span>
                )}
                <div
                  className="inline-flex items-center justify-center rounded-[14px] w-14 h-14"
                  style={{
                    background: "rgba(185,232,72,.18)",
                    color: "var(--ds-secondary)",
                  }}
                >
                  <Image src={service.icon} alt="" width={28} height={28} />
                </div>
                <div>
                  <h3 className="ds-card-title" style={{ fontSize: 18 }}>
                    {service.title}
                  </h3>
                  <p className="ds-card-sub" style={{ margin: "8px 0 0" }}>
                    {service.description}
                  </p>
                </div>
              </article>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
