"use client";

import { User, Monitor, Users, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { HandDrawnArrow } from "@/components/illustrations/decorative-elements";

const steps = [
  {
    icon: User,
    title: "LICENCIADO",
    subtitle: "Voce capta clientes e gerencia pedidos",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Monitor,
    title: "PLATAFORMA",
    subtitle: "Sistema completo para gestao de pedidos",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: Users,
    title: "ESPECIALISTAS",
    subtitle: "Nossa equipe executa cada servico",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Building2,
    title: "CLIENTE FINAL",
    subtitle: "Recebe o servico com a sua marca",
    color: "bg-accent/20 text-accent-foreground",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function WhatIs() {
  return (
    <section id="what-is" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
            Como tudo se conecta
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que e a OfficeBiz?
          </h2>
          <p className="text-lg text-muted-foreground">
            Uma plataforma white-label que permite a qualquer pessoa oferecer
            servicos empresariais completos — sem precisar de equipe propria.
            Voce gerencia seus clientes, nos cuidamos da execucao.
          </p>
        </motion.div>

        {/* Flow diagram */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 max-w-4xl mx-auto"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={itemVariants}
              className="flex flex-col md:flex-row items-center"
            >
              {/* Step card */}
              <div className="flex flex-col items-center text-center w-48 group">
                <div
                  className={`w-18 h-18 rounded-2xl ${step.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                  style={{ width: "4.5rem", height: "4.5rem" }}
                >
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-foreground tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                  {step.subtitle}
                </p>
              </div>

              {/* Hand-drawn arrow between steps */}
              {index < steps.length - 1 && (
                <>
                  <HandDrawnArrow className="hidden md:block w-16 h-6 text-primary/40 mx-2 shrink-0" />
                  <div className="md:hidden my-3">
                    <svg viewBox="0 0 24 60" className="w-4 h-10 text-primary/40" fill="none">
                      <path
                        d="M12 2 C10 20, 14 30, 12 48"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M6 42 L12 50 L18 42"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
