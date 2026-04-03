"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/illustrations/hero-illustration";
import { GradientBlob, GradientBlobAlt, FloatingDots } from "@/components/illustrations/decorative-elements";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background decorative elements */}
      <GradientBlob className="absolute -top-40 -right-40 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] pointer-events-none" />
      <GradientBlobAlt className="absolute -bottom-40 -left-40 w-[250px] h-[250px] sm:w-[400px] sm:h-[400px] lg:w-[500px] lg:h-[500px] pointer-events-none" />
      <FloatingDots className="absolute top-20 left-10 w-40 h-40 text-primary pointer-events-none hidden lg:block" />
      <FloatingDots className="absolute bottom-20 right-10 w-32 h-32 text-primary pointer-events-none hidden lg:block" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-start gap-6 text-left"
          >
            <Badge className="bg-primary/10 text-primary text-sm px-4 py-1.5 rounded-full border border-primary/20">
              R$ 0 de entrada
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Tenha seu próprio negócio de serviços empresariais
              <span className="text-primary"> — sem investimento inicial</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
              Plataforma completa + equipe de especialistas. Você gerencia, nós
              executamos. Tudo que uma empresa precisa, em um só lugar.
            </p>

            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Zero taxa de licença
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Zero setup
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Zero treinamento
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <a href="#contact">
                <Button size="lg" className="shadow-lg shadow-primary/20">
                  Quero minha licença &rarr;
                </Button>
              </a>
              <a href="#how-it-works">
                <Button size="lg" variant="outline">
                  Veja como funciona &darr;
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Right — Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="hidden lg:block"
          >
            <HeroIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
