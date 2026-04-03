"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SparkleStars, FloatingDots } from "@/components/illustrations/decorative-elements";
import { SectionHeader } from "@/components/landing/section-header";
import { Section } from "@/components/landing/section";

const freeItems = [
  "Taxa de Licença — R$ 0",
  "Taxa de Setup — R$ 0",
  "Taxa de Treinamento — R$ 0",
];

const includedItems = [
  "Plataforma completa de gestão",
  "Equipe de especialistas",
  "Suporte dedicado via WhatsApp",
  "Marca própria (white-label)",
  "Sem fidelidade ou multa",
];

export function Pricing() {
  return (
    <Section id="pricing" background="muted">
      {/* Decorative elements */}
      <FloatingDots className="absolute top-10 left-10 w-40 h-40 text-primary pointer-events-none hidden lg:block" />
      <FloatingDots className="absolute bottom-10 right-10 w-32 h-32 text-primary pointer-events-none hidden lg:block" />

      <div className="relative z-10">
        <SectionHeader
          subtitle="Investimento acessível"
          title="Quanto custa? Menos do que você imagina."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-lg mx-auto"
        >
          {/* Sparkle decorations */}
          <SparkleStars className="absolute -top-8 -left-8 w-20 h-20 text-primary pointer-events-none hidden md:block" />
          <SparkleStars className="absolute -bottom-6 -right-6 w-16 h-16 text-primary rotate-45 pointer-events-none hidden md:block" />

          <Card className="border-2 border-primary/20 shadow-2xl shadow-primary/10 bg-card relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />

            <CardContent className="p-8 md:p-10 relative">
              {/* Free items */}
              <div className="space-y-3 mb-6">
                {freeItems.map((item, i) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-foreground font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Price */}
              <div className="text-center space-y-2 mb-6">
                <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                  Manutenção mensal
                </p>
                <motion.p
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
                  className="text-5xl md:text-6xl font-bold text-primary"
                >
                  R$ 390
                  <span className="text-lg font-normal text-muted-foreground">
                    /mês
                  </span>
                </motion.p>
                <p className="text-sm text-muted-foreground">
                  Único custo. Sem surpresas. Sem fidelidade.
                </p>
                <Badge
                  variant="secondary"
                  className="mt-2 bg-primary/10 text-primary border-primary/20"
                >
                  Cancele quando quiser
                </Badge>
              </div>

              <Separator className="my-6" />

              {/* Included items */}
              <div className="space-y-2.5 mb-8">
                {includedItems.map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-primary/60 shrink-0" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a href="#contact">
                <Button size="lg" className="w-full shadow-lg shadow-primary/20">
                  Começar agora — R$ 0 de entrada
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>

        {/* Comparison text */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Montar sozinho</strong> custa de
            R$ 5.000 a R$ 15.000 em equipe, ferramentas e infraestrutura.{" "}
            <strong className="text-foreground">Com a OfficeBiz</strong>, você
            começa com R$ 0 de entrada e paga apenas R$ 390/mês — com tudo
            incluso.
          </p>
        </motion.div>
      </div>
    </Section>
  );
}
