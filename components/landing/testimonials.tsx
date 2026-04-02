"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Star, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { fadeInView } from "@/lib/motion";

const testimonials = [
  {
    quote:
      "Em menos de um mês já tinha 5 clientes. A plataforma é intuitiva e o suporte responde super rápido. Melhor decisão que tomei!",
    name: "Maria Silva",
    role: "Consultora Empresarial",
    city: "São Paulo, SP",
    avatar: "MS",
  },
  {
    quote:
      "Eu já atendia alguns clientes com contabilidade, mas com a OfficeBiz consegui ampliar meu portfólio sem contratar ninguém. Meu faturamento triplicou.",
    name: "Carlos Mendes",
    role: "Contador",
    city: "Belo Horizonte, MG",
    avatar: "CM",
  },
  {
    quote:
      "O modelo white-label é incrível. Meus clientes acham que tenho uma mega estrutura. Recomendo para qualquer empreendedor digital.",
    name: "Ana Costa",
    role: "Empreendedora Digital",
    city: "Curitiba, PR",
    avatar: "AC",
  },
];

export function Testimonials() {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(next, 5000);
  }, [next]);

  useEffect(() => {
    resetTimer();

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      } else {
        resetTimer();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [resetTimer]);

  return (
    <section id="testimonials" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          {...fadeInView}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
            Depoimentos reais
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que nossos licenciados dizem
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Testimonial card */}
          <Card className="border border-border/60 bg-card shadow-lg relative overflow-hidden">
            {/* Quote decoration */}
            <Quote className="absolute top-6 right-6 w-10 h-10 text-primary/8" />

            <CardContent className="p-8 md:p-10 text-center">
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 fill-warning text-warning"
                  />
                ))}
              </div>

              {/* Quote */}
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={active}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg text-foreground leading-relaxed mb-8 min-h-[80px]"
                >
                  &ldquo;{testimonials[active].quote}&rdquo;
                </motion.blockquote>
              </AnimatePresence>

              {/* Author */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {testimonials[active].avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {testimonials[active].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {testimonials[active].role} &middot;{" "}
                      {testimonials[active].city}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActive(i); resetTimer(); }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === active
                    ? "bg-primary w-8"
                    : "bg-border w-2 hover:bg-primary/30"
                }`}
                aria-label={`Depoimento ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
