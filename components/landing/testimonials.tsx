"use client";

import { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % testimonials.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, [next]);

  return (
    <section id="testimonials" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que nossos licenciados dizem
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Testimonial card */}
          <Card className="border border-border bg-white shadow-md">
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
              <blockquote className="text-lg text-foreground leading-relaxed mb-8 min-h-[80px]">
                &ldquo;{testimonials[active].quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
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
              </div>
            </CardContent>
          </Card>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === active ? "bg-primary" : "bg-border"
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
