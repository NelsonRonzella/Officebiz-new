"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "Preciso ter CNPJ pra ser licenciado?",
    answer:
      "Não. Você pode começar como pessoa física. Quando quiser abrir o CNPJ, podemos ajudar — inclusive esse é um dos serviços da plataforma.",
  },
  {
    question: "Preciso montar uma equipe?",
    answer:
      "Não. A execução de todos os serviços é feita pela equipe da OfficeBiz. Você só precisa focar em captar clientes e fazer os pedidos pelo painel.",
  },
  {
    question: "Como eu ganho dinheiro?",
    answer:
      "Você define o preço que cobra dos seus clientes. A diferença entre o que você cobra e o custo do serviço na plataforma é o seu lucro. Sem teto, sem split forçado.",
  },
  {
    question: "Tem contrato de fidelidade?",
    answer:
      "Não. Você pode cancelar a qualquer momento, sem multa e sem burocracia. Acreditamos que você fica porque quer, não porque é obrigado.",
  },
  {
    question: "Quanto custa pra começar?",
    answer:
      "Hoje a licença é R$ 2.990 (pagamento único) que dá acesso por 2 anos — em promoção, 3 anos pelo mesmo preço. Não tem taxa de setup nem de treinamento.",
  },
  {
    question: "Posso usar minha própria marca?",
    answer:
      "Sim. O modelo é 100% white-label. Seus clientes interagem com a sua marca, sua identidade visual. A OfficeBiz opera nos bastidores.",
  },
  {
    question: "Preciso ter experiência na área?",
    answer:
      "Não. Oferecemos treinamento, materiais de apoio e a equipe de especialistas cuida de toda a parte técnica dos serviços que você vende.",
  },
  {
    question: "Quantos clientes posso atender?",
    answer:
      "Não há limite. A plataforma é escalável e cresce com o seu negócio. Quanto mais clientes você tiver, maior o seu faturamento.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="ds-section ds-section--alt">
      <div className="ds-container">
        <motion.div
          className="ds-section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-eyebrow">07 · Dúvidas frequentes</span>
          <h2>Perguntas que todo licenciado faz no começo.</h2>
        </motion.div>

        <div className="ds-faq-list">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className="ds-faq-item"
                data-open={isOpen ? "true" : "false"}
              >
                <button
                  type="button"
                  className="ds-faq-trigger"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-content-${i}`}
                >
                  <span>{faq.question}</span>
                  <span className="icon" aria-hidden>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M12 5v14 M5 12h14" />
                    </svg>
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      id={`faq-content-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="ds-faq-content">{faq.answer}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
