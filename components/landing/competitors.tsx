"use client";

import { motion } from "framer-motion";

type Row = {
  label: string;
  competitorA: string;
  competitorB: string;
  competitorC: string;
  officebiz: string;
  highlight?: boolean;
};

const rows: Row[] = [
  {
    label: "Investimento inicial",
    competitorA: "R$ 14.900",
    competitorB: "R$ 25.900",
    competitorC: "R$ 31.900",
    officebiz: "R$ 0",
    highlight: true,
  },
  {
    label: "Mensalidade / royalties",
    competitorA: "R$ 706/mês + marketing",
    competitorB: "R$ 270/mês + taxas",
    competitorC: "% do faturamento",
    officebiz: "R$ 390/mês fixo",
    highlight: true,
  },
  {
    label: "Setup e treinamento",
    competitorA: "Semanas",
    competitorB: "Curso obrigatório",
    competitorC: "Treinamento presencial",
    officebiz: "0 dia · acesso imediato",
  },
  {
    label: "Suporte",
    competitorA: "Chamado · dias",
    competitorB: "E-mail",
    competitorC: "Horário comercial",
    officebiz: "WhatsApp · resposta em horas",
  },
  {
    label: "Plataforma",
    competitorA: "Sistema legado",
    competitorB: "Software desktop",
    competitorC: "Painel limitado",
    officebiz: "100% nuvem · moderna",
  },
  {
    label: "White-label (sua marca)",
    competitorA: "Não",
    competitorB: "Parcial",
    competitorC: "Não",
    officebiz: "Sim · totalmente sua",
  },
  {
    label: "Margem para revenda",
    competitorA: "Limitada",
    competitorB: "Limitada",
    competitorC: "Limitada",
    officebiz: "Até 3× sobre o custo",
    highlight: true,
  },
  {
    label: "Fidelidade / contrato",
    competitorA: "5 anos",
    competitorB: "3 anos",
    competitorC: "Multa por saída",
    officebiz: "Sem fidelidade",
  },
];

export function Competitors() {
  return (
    <section id="competitors" className="ds-section ds-comp-section">
      <div className="ds-container">
        <motion.div
          className="ds-section-head"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <span className="ds-eyebrow">07 · Por que escolher a OfficeBiz</span>
          <h2>Mais qualidade, mais tecnologia — por uma fração do preço.</h2>
          <p>
            Comparamos com franquias tradicionais de serviços empresariais no Brasil.
            Os números falam por si.
          </p>
        </motion.div>

        <motion.div
          className="ds-comp-table"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="ds-comp-head">
            <div className="ds-comp-cell ds-comp-cell--label" />
            <div className="ds-comp-cell ds-comp-col">
              <div className="ds-comp-logo">A</div>
              <span>Franquia tradicional</span>
            </div>
            <div className="ds-comp-cell ds-comp-col">
              <div className="ds-comp-logo">B</div>
              <span>Plataforma legada</span>
            </div>
            <div className="ds-comp-cell ds-comp-col">
              <div className="ds-comp-logo">C</div>
              <span>Marca consolidada</span>
            </div>
            <div className="ds-comp-cell ds-comp-col ds-comp-col--ours">
              <div className="ds-comp-logo ds-comp-logo--ours">OB</div>
              <span>OfficeBiz</span>
            </div>
          </div>

          {rows.map((row) => (
            <div className="ds-comp-row" key={row.label}>
              <div className="ds-comp-cell ds-comp-cell--label">{row.label}</div>
              <div className="ds-comp-cell">{row.competitorA}</div>
              <div className="ds-comp-cell">{row.competitorB}</div>
              <div className="ds-comp-cell">{row.competitorC}</div>
              <div
                className={`ds-comp-cell ds-comp-cell--ours ${
                  row.highlight ? "ds-comp-cell--highlight" : ""
                }`}
              >
                {row.officebiz}
              </div>
            </div>
          ))}
        </motion.div>

        <motion.p
          className="ds-comp-foot"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Dados das franquias baseados em valores públicos divulgados pelas redes
          em 2026. Sem entrada, sem royalties, sem letras miúdas.
        </motion.p>
      </div>
    </section>
  );
}
