"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  {
    quote:
      "Em menos de um mês já tinha 5 clientes. A plataforma é intuitiva e o suporte responde super rápido. Melhor decisão que tomei.",
    name: "Maria Silva",
    role: "Consultora Empresarial · São Paulo, SP",
    avatar: "/landing/images/avatar-1.avif",
  },
  {
    quote:
      "Eu já atendia alguns clientes com contabilidade, mas com a OfficeBiz consegui ampliar meu portfólio sem contratar ninguém. Meu faturamento triplicou.",
    name: "Carlos Mendes",
    role: "Contador · Belo Horizonte, MG",
    avatar: "/landing/images/avatar-2.avif",
  },
  {
    quote:
      "O modelo white-label é incrível. Meus clientes acham que tenho uma mega estrutura. Recomendo pra qualquer empreendedor digital.",
    name: "Ana Costa",
    role: "Empreendedora Digital · Curitiba, PR",
    avatar: "/landing/images/avatar-3.avif",
  },
  {
    quote:
      "Adquiri a licença mês passado, vendi 3 abertura de CNPJs na primeira semana. O time executa com qualidade, sem precisar de revisão minha.",
    name: "Rafael Almeida",
    role: "Sócio · RA Consultoria · Recife, PE",
    avatar: "/landing/images/avatar-4.avif",
  },
  {
    quote:
      "Trabalho como designer e agora consigo vender pacote completo: marca + site + CNPJ. Faturamento por cliente quadruplicou.",
    name: "Patrícia Rocha",
    role: "Designer · Florianópolis, SC",
    avatar: "/landing/images/avatar-5.avif",
  },
];

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M12 2l2.9 6.6L22 10l-5.5 4.7L18.2 22 12 18.3 5.8 22l1.7-7.3L2 10l7.1-1.4z" />
    </svg>
  );
}

export function Testimonials() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 6000);
  }, [next]);

  useEffect(() => {
    resetTimer();

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        resetTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [resetTimer]);

  const t = testimonials[active];

  return (
    <section id="testimonials" className="ds-section">
      <div className="ds-container">
        <motion.div
          className="ds-section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-eyebrow">08 · Depoimentos reais</span>
          <h2>O que os licenciados estão falando.</h2>
          <p>Nada de stock — depoimentos de quem opera a plataforma todo dia.</p>
        </motion.div>

        <div className="ds-testimonial">
          <div className="ds-testimonial-stars" aria-label="5 estrelas">
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
            <StarIcon />
          </div>

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={active}
              className="ds-testimonial-quote"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              {t.quote}
            </motion.blockquote>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={`author-${active}`}
              className="ds-testimonial-author"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div
                className="ds-testimonial-avatar"
                style={{ backgroundImage: `url(${t.avatar})` }}
                role="img"
                aria-label={`Avatar de ${t.name}`}
              />
              <div>
                <p className="ds-testimonial-name">{t.name}</p>
                <p className="ds-testimonial-role">{t.role}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="ds-testimonial-dots">
          {testimonials.map((_, i) => (
            <button
              key={i}
              className={i === active ? "is-active" : ""}
              onClick={() => {
                setActive(i);
                resetTimer();
              }}
              aria-label={`Ver depoimento ${i + 1}`}
            />
          ))}
        </div>

        <div className="ds-logo-cloud ds-logo-cloud--light mt-12">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <img
              key={n}
              src={`/landing/images/client-logo-${n}.svg`}
              alt={`Cliente ${n}`}
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
