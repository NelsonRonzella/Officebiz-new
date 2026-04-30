"use client";

import Image from "next/image";
import Link from "next/link";
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
          R$ 0 de entrada · sem fidelidade
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

        <motion.div
          className="hidden md:grid grid-cols-2 gap-6 max-w-[1000px] mx-auto mt-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="ds-hero-shot">
            <div className="ds-hero-shot-frame">
              <Image
                src="/landing/features/dashboard.png"
                alt="Painel do licenciado da OfficeBiz"
                width={1340}
                height={950}
                className="!relative"
                priority={false}
              />
            </div>
            <span className="ds-hero-shot-tag">Painel · Licenciado</span>
            <div className="ds-hero-shot-meta">
              <h4>Gestão de pedidos</h4>
              <small>Acompanhe cada serviço em tempo real</small>
            </div>
          </div>
          <div className="ds-hero-shot">
            <div className="ds-hero-shot-frame">
              <Image
                src="/landing/features/dashboard.png"
                alt="Métricas e gráficos do dashboard"
                width={1340}
                height={950}
                className="!relative ds-hero-shot--bottom"
                priority={false}
              />
            </div>
            <span className="ds-hero-shot-tag">Faturamento · em tempo real</span>
            <div className="ds-hero-shot-meta">
              <h4>Indicadores claros</h4>
              <small>Margens, vendas e crescimento por serviço</small>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
