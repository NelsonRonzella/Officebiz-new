"use client";

import { CheckCircle, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SparkleStars, FloatingDots } from "@/components/illustrations/decorative-elements";
import { SectionHeader } from "@/components/landing/section-header";
import { Section } from "@/components/landing/section";
import { CLOSER_WHATSAPP_URL, LICENSE_PRICE_LABEL } from "@/lib/pricing";

const includedItems = [
  "Plataforma completa de gestão",
  "Equipe de especialistas",
  "Suporte dedicado via WhatsApp",
  "Marca própria (white-label)",
  "Treinamento incluso",
];

export function Pricing() {
  return (
    <Section id="pricing" background="muted">
      {/* Decorative elements */}
      <FloatingDots className="absolute top-10 left-10 w-40 h-40 text-primary pointer-events-none hidden lg:block" />
      <FloatingDots className="absolute bottom-10 right-10 w-32 h-32 text-primary pointer-events-none hidden lg:block" />

      <div className="relative z-10">
        <SectionHeader
          subtitle="Investimento único"
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
              {/* Label */}
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground text-center mb-6">
                Licença OfficeBiz
              </p>

              {/* Price */}
              <div className="text-center space-y-2 mb-6">
                <motion.p
                  initial={{ scale: 0.9, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  className="text-6xl md:text-7xl font-bold text-primary"
                >
                  {LICENSE_PRICE_LABEL}
                </motion.p>
                <p className="text-sm text-muted-foreground">
                  pagamento único
                </p>
              </div>

              {/* Main feature + promo */}
              <div className="flex flex-col items-center gap-3 mb-8">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-foreground font-semibold text-lg">
                    2 anos de acesso
                  </span>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
                  Promoção: 3 anos pelo mesmo preço
                </Badge>
              </div>

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
              <a href={CLOSER_WHATSAPP_URL} target="_blank" rel="noreferrer">
                <Button size="lg" className="w-full shadow-lg shadow-primary/20">
                  <Phone className="w-4 h-4 mr-2" />
                  Falar com especialista
                </Button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Section>
  );
}
