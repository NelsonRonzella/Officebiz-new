"use client";

import { KeyRound, UserPlus, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { staggerContainer, fadeInItem } from "@/lib/motion";
import { SectionHeader } from "@/components/landing/section-header";
import { Section } from "@/components/landing/section";

const steps = [
  {
    number: "1",
    icon: KeyRound,
    title: "Adquira sua licença",
    description:
      "Cadastre-se gratuitamente e receba acesso imediato ao painel de licenciado.",
    accent: "from-primary/10 to-primary/5",
  },
  {
    number: "2",
    icon: UserPlus,
    title: "Cadastre seus clientes",
    description:
      "Adicione seus clientes na plataforma e ofereça os serviços do portfólio.",
    accent: "from-accent/15 to-accent/5",
  },
  {
    number: "3",
    icon: ClipboardList,
    title: "Faça pedidos pelo painel",
    description:
      "Solicite serviços com poucos cliques. Nossa equipe cuida de toda a execução.",
    accent: "from-primary/10 to-primary/5",
  },
];

const containerVariants = staggerContainer(0.2);
const itemVariants = fadeInItem("y", 30, 0.5);

export function HowItWorks() {
  return (
    <Section id="how-it-works">
      <SectionHeader
        subtitle="Simples e rápido"
        title="Como funciona? Simples assim."
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="relative grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
      >
        {/* Hand-drawn connecting line - desktop */}
        <svg
          className="hidden md:block absolute top-16 left-[18%] right-[18%] h-4 pointer-events-none"
          viewBox="0 0 600 20"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 10 C100 4, 200 16, 300 10 C400 4, 500 16, 600 10"
            stroke="var(--color-primary, #22c55e)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="8 6"
            opacity="0.25"
          />
        </svg>

        {steps.map((step) => (
          <motion.div key={step.number} variants={itemVariants}>
            <Card className="relative overflow-hidden border-0 shadow-none bg-transparent h-full">
              <CardContent className="flex flex-col items-center text-center p-6">
                {/* Number + Icon circle */}
                <div className="relative mb-6">
                  <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.accent} flex items-center justify-center`}>
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  {/* Step number badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                    {step.number}
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}
