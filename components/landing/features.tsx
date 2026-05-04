"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Clock, Shield, Search, Building2, Globe } from "lucide-react";

function CheckBullet({ children }: { children: React.ReactNode }) {
  return (
    <li
      className="flex items-start gap-2.5 text-[14px] leading-[1.5]"
      style={{ color: "var(--ds-text-muted)" }}
    >
      <span
        className="inline-flex items-center justify-center rounded-full shrink-0 mt-[3px]"
        style={{
          width: 16,
          height: 16,
          background: "var(--ds-primary)",
          color: "var(--ds-secondary-deep)",
        }}
      >
        <Check size={10} strokeWidth={3.5} />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function Features() {
  return (
    <section id="features" className="ds-section">
      <div className="ds-container">
        <motion.div
          className="ds-section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-eyebrow">03 · Ferramentas inclusas</span>
          <h2>Mais que serviços: uma plataforma pra você operar.</h2>
          <p>
            Cada licença vem com um conjunto de ferramentas pra te ajudar a fechar mais,
            consultar antes de prometer e organizar a entrega — tudo dentro do mesmo painel.
          </p>
        </motion.div>

        {/* HERO FEATURE: Cronograma */}
        <motion.article
          className="ds-feature-hero"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="ds-feature-hero-text">
            <span className="ds-feature-pill">
              <Clock size={14} strokeWidth={2} />
              Cronograma de entrega
            </span>
            <h3>Cada pedido com etapas claras e prazos definidos.</h3>
            <p>
              Você acompanha em tempo real onde cada serviço está. Cliente também enxerga,
              sem precisar te ligar a cada dois dias perguntando &ldquo;e aí?&rdquo;.
            </p>
            <ul className="ds-feature-bullets">
              <CheckBullet>Etapas pré-configuradas por tipo de serviço</CheckBullet>
              <CheckBullet>Prazos automáticos com alertas de movimentação</CheckBullet>
              <CheckBullet>Visão compartilhada com o cliente final</CheckBullet>
            </ul>
          </div>
          <div className="ds-feature-hero-media">
            <div className="ds-feature-screenshot ds-feature-screenshot--tall">
              <Image
                src="/landing/features/cronograma.png"
                alt="Tela de cronograma de etapas do pedido"
                width={520}
                height={1000}
                className="!relative"
              />
            </div>
            <div className="ds-feature-glow" aria-hidden />
          </div>
        </motion.article>

        {/* GRID: Marca + Leads */}
        <div className="ds-feature-grid mt-8">
          <motion.article
            className="ds-feature-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="ds-feature-screenshot ds-feature-screenshot--landscape">
              <Image
                src="/landing/features/consulta-marca.png"
                alt="Tela de consulta de marca no INPI"
                width={860}
                height={620}
                className="!relative"
              />
            </div>
            <div className="ds-feature-card-body">
              <span className="ds-feature-pill">
                <Shield size={14} strokeWidth={2} />
                Consulta de marca
              </span>
              <h3>Verifique se a marca tá liberada antes de cobrar.</h3>
              <p>
                Pesquisa direta no INPI por nome, classe e princípio da especialidade. Você
                fala com o cliente já com a viabilidade na mão.
              </p>
            </div>
          </motion.article>

          <motion.article
            className="ds-feature-card ds-feature-card--portrait"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="ds-feature-card-body">
              <span className="ds-feature-pill">
                <Search size={14} strokeWidth={2} />
                Buscador de leads
              </span>
              <h3>Ache potenciais clientes por região e segmento.</h3>
              <p>
                Filtre por cidade, raio de atuação e categoria do CNPJ — clínicas
                odontológicas em São Paulo, por exemplo. Você sai com WhatsApp,
                contato e endereço pra prospectar.
              </p>
              <ul className="ds-feature-bullets" style={{ marginTop: 16 }}>
                <CheckBullet>Filtros por cidade, raio e categoria</CheckBullet>
                <CheckBullet>Dados de contato direto (WhatsApp, telefone)</CheckBullet>
              </ul>
            </div>
            <div className="ds-feature-screenshot ds-feature-screenshot--portrait">
              <Image
                src="/landing/features/buscador-leads.png"
                alt="Tela do buscador de leads"
                width={420}
                height={620}
                className="!relative"
              />
            </div>
          </motion.article>
        </div>

        {/* GRID: CNPJ + Domínio (lado a lado) */}
        <div className="ds-feature-grid-pair mt-6">
          <motion.article
            className="ds-feature-mini"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
          >
            <div className="ds-feature-mini-icon">
              <Building2 size={20} strokeWidth={2} />
            </div>
            <div>
              <h3>Consulta de CNPJ</h3>
              <p>
                Puxe dados completos da Receita Federal: razão social, endereço,
                situação cadastral e quadro societário. Em segundos.
              </p>
            </div>
            <div className="ds-feature-mini-shot">
              <Image
                src="/landing/features/consulta-cnpj.png"
                alt="Tela de consulta de CNPJ"
                width={860}
                height={220}
                className="!relative"
              />
            </div>
          </motion.article>

          <motion.article
            className="ds-feature-mini"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: 0.08 }}
          >
            <div className="ds-feature-mini-icon">
              <Globe size={20} strokeWidth={2} />
            </div>
            <div>
              <h3>Consulta de domínio</h3>
              <p>
                Antes de fechar um site ou e-mail, confira se o domínio está livre.
                Cobre os principais registros (.com, .com.br, .net, etc.).
              </p>
            </div>
            <div className="ds-feature-mini-grid">
              <span>seudominio.com</span>
              <span className="ok">Disponível</span>
              <span>seudominio.com.br</span>
              <span className="busy">Em uso</span>
              <span>seudominio.net</span>
              <span className="ok">Disponível</span>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
