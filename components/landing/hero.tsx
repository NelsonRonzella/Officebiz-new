"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/5 to-background pt-20">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <Badge className="bg-accent text-accent-foreground text-sm px-4 py-1.5 rounded-full">
            R$ 0 de entrada
          </Badge>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Tenha seu próprio negócio de serviços empresariais
            <span className="text-primary"> — sem investimento inicial</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Plataforma completa + equipe de especialistas. Você gerencia, nós
            executamos. Tudo que uma empresa precisa, em um só lugar.
          </p>

          {/* Seal */}
          <p className="text-sm text-muted-foreground">
            Zero taxa de licença &middot; Zero setup &middot; Zero treinamento
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a href="#contact">
              <Button size="lg">Quero minha licença &rarr;</Button>
            </a>
            <a href="#how-it-works">
              <Button size="lg" variant="outline">Veja como funciona &darr;</Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
