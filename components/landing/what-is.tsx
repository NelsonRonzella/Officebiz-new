import { User, Monitor, Users, Building2, ArrowRight, ArrowDown } from "lucide-react";

const steps = [
  {
    icon: User,
    title: "LICENCIADO",
    subtitle: "Você capta clientes e gerencia pedidos",
  },
  {
    icon: Monitor,
    title: "PLATAFORMA",
    subtitle: "Sistema completo para gestão de pedidos",
  },
  {
    icon: Users,
    title: "ESPECIALISTAS",
    subtitle: "Nossa equipe executa cada serviço",
  },
  {
    icon: Building2,
    title: "CLIENTE FINAL",
    subtitle: "Recebe o serviço com a sua marca",
  },
];

export function WhatIs() {
  return (
    <section id="what-is" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            O que é a OfficeBiz?
          </h2>
          <p className="text-lg text-muted-foreground">
            A OfficeBiz é uma plataforma white-label que permite a qualquer
            pessoa oferecer serviços empresariais completos — como abertura de
            CNPJ, contabilidade, criação de marcas, sites e muito mais — sem
            precisar de equipe própria. Você gerencia seus clientes, nós
            cuidamos da execução.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col md:flex-row items-center">
              {/* Step card */}
              <div className="flex flex-col items-center text-center w-48">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground tracking-wide">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {step.subtitle}
                </p>
              </div>

              {/* Arrow between steps */}
              {index < steps.length - 1 && (
                <>
                  <ArrowRight className="hidden md:block w-6 h-6 text-primary/40 mx-4 shrink-0" />
                  <ArrowDown className="md:hidden w-6 h-6 text-primary/40 my-2 shrink-0" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
