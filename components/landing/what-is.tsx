"use client";

import { User, Monitor, Users, Building2 } from "lucide-react";
import { motion } from "framer-motion";
import { HandDrawnArrow } from "@/components/illustrations/decorative-elements";
import { staggerContainer, fadeInItem } from "@/lib/motion";
import { SectionHeader } from "@/components/landing/section-header";
import { Section } from "@/components/landing/section";

const steps = [
  {
    icon: User,
    title: "LICENCIADO",
    subtitle: "Você capta clientes e gerencia pedidos",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Monitor,
    title: "PLATAFORMA",
    subtitle: "Sistema completo para gestão de pedidos",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    icon: Users,
    title: "ESPECIALISTAS",
    subtitle: "Nossa equipe executa cada serviço",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Building2,
    title: "CLIENTE FINAL",
    subtitle: "Recebe o serviço com a sua marca",
    color: "bg-accent/20 text-accent-foreground",
  },
];

const containerVariants = staggerContainer(0.15);
const itemVariants = fadeInItem("y", 20, 0.5);

export function WhatIs() {
  return (
    <Section id="what-is">
      <SectionHeader
        subtitle="Como tudo se conecta"
        title="O que é a OfficeBiz?"
        description="Uma plataforma white-label que permite a qualquer pessoa oferecer serviços empresariais completos — sem precisar de equipe própria. Você gerencia seus clientes, nós cuidamos da execução."
      />

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
            <div className="flex flex-col items-center text-center w-36 sm:w-44 md:w-48 group">
              <div
                className={`size-[4.5rem] rounded-2xl ${step.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
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
    </Section>
  );
}
