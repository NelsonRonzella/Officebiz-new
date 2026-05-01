"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export function Hero() {
  return (
    <header className="ds-hero">
      <div className="ds-orb ds-orb--1" />
      <div className="ds-orb ds-orb--2" />
      <div className="ds-orb ds-orb--3" />

      <div className="ds-container ds-hero-inner">
        <motion.span
          className="ds-hero-tag"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Sem taxa de setup
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Seu negócio de serviços
          <br />
          empresariais{" "}
          <span className="accent">sem investimento.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Plataforma completa + equipe de especialistas. Você gerencia, nós executamos.
          Tudo que uma empresa precisa, em um só lugar — com a sua marca.
        </motion.p>

        <motion.div
          className="ds-hero-actions"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a href="#pricing" className="ds-btn ds-btn--primary">
            Quero minha licença
            <span className="arrow" aria-hidden>→</span>
          </a>
          <a href="#how-it-works" className="ds-btn ds-btn--ghost">
            Veja como funciona
            <span className="arrow" aria-hidden>↓</span>
          </a>
        </motion.div>

        <motion.div
          className="ds-hero-stage"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          <div className="ds-hero-frame">
            <div className="ds-hero-frame-grid">
              <div className="ds-hero-stat">
                <div className="label">Serviços no portfólio</div>
                <div className="value">12+</div>
                <div className="delta">Prontos pra revenda</div>
              </div>
              <div className="ds-hero-stat">
                <div className="label">Margem média</div>
                <div className="value">3×</div>
                <div className="delta">Sobre o custo de execução</div>
              </div>
              <div className="ds-hero-stat">
                <div className="label">Setup do licenciado</div>
                <div className="value">0 dia</div>
                <div className="delta">Acesso imediato</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="ds-hero-dash">
        <div className="ds-dash-header">
          <span className="ds-eyebrow ds-eyebrow--light">Painel · Licenciado</span>
          <h2 className="ds-dash-title">Tudo num só painel.</h2>
          <p className="ds-dash-sub">
            Pedidos, faturamento e clientes em tempo real — pronto pra você operar com a sua marca.
          </p>
        </div>
        <div className="ds-dash-stage">
          <div className="ds-dash-card">
            <div className="ds-dash-screen">
              <div className="ds-dash-mock">
                <div className="ds-dash-bar">
                  <div className="ds-dash-dots" aria-hidden>
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="ds-dash-url">officebiz.com.br/dashboard</div>
                  <div className="ds-dash-actions" aria-hidden />
                </div>
                <div className="ds-dash-image">
                  <Image
                    src="/landing/features/dashboard.png"
                    alt="Painel do licenciado da OfficeBiz"
                    fill
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    className="ds-dash-img"
                    priority={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
