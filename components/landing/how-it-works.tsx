"use client";

import { KeyRound, UserPlus, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    icon: KeyRound,
    title: "Adquira sua licença",
    description:
      "Cadastre-se gratuitamente e receba acesso imediato ao painel de licenciado.",
  },
  {
    number: "2",
    icon: UserPlus,
    title: "Cadastre seus clientes",
    description:
      "Adicione seus clientes na plataforma e ofereça os serviços do portfólio.",
  },
  {
    number: "3",
    icon: ClipboardList,
    title: "Faça pedidos pelo painel",
    description:
      "Solicite serviços com poucos cliques. Nossa equipe cuida de toda a execução.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como funciona? Simples assim.
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-4xl mx-auto"
        >
          {/* Connecting line - desktop */}
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-border" />

          {/* Connecting line - mobile */}
          <div className="md:hidden absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-border" />

          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Number circle */}
              <div className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6">
                <step.icon className="w-8 h-8 text-primary-foreground" />
              </div>

              <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2">
                Passo {step.number}
              </span>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
