"use client";

import { Phone, ShieldCheck, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingDots, Squiggle } from "@/components/illustrations/decorative-elements";
import { Section } from "@/components/landing/section";
import { CLOSER_WHATSAPP_URL } from "@/lib/pricing";

export function CtaFinal() {
  return (
    <Section
      id="contact"
      className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground"
    >
      {/* Decorative background elements */}
      <FloatingDots className="absolute top-10 left-10 w-48 h-48 text-primary-foreground/10 pointer-events-none" />
      <FloatingDots className="absolute bottom-10 right-10 w-40 h-40 text-primary-foreground/10 pointer-events-none" />
      <Squiggle className="absolute top-1/4 right-[5%] w-32 text-primary-foreground/10 pointer-events-none hidden lg:block" />
      <Squiggle className="absolute bottom-1/3 left-[5%] w-24 text-primary-foreground/10 pointer-events-none hidden lg:block rotate-12" />

      {/* Subtle pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-10">
              Sem taxa de entrada. Sem risco. Sem burocracia.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <a href={CLOSER_WHATSAPP_URL} target="_blank" rel="noreferrer">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/90 shadow-lg text-base px-8 py-6"
              >
                <Phone className="w-5 h-5 mr-2" />
                Falar com especialista
              </Button>
            </a>
          </motion.div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <Badge
              variant="secondary"
              className="bg-white/10 text-primary-foreground border-white/15"
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              Sem compromisso
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/10 text-primary-foreground border-white/15"
            >
              <Headphones className="w-3 h-3 mr-1" />
              Suporte incluso
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/10 text-primary-foreground border-white/15"
            >
              <Phone className="w-3 h-3 mr-1" />
              Atendimento via WhatsApp
            </Badge>
          </div>
        </div>
      </div>
    </Section>
  );
}
