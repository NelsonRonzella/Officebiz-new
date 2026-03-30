import { CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const freeItems = [
  "Taxa de Licença — R$ 0",
  "Taxa de Setup — R$ 0",
  "Taxa de Treinamento — R$ 0",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 lg:py-28 bg-surface">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Quanto custa? Menos do que você imagina.
          </h2>
        </div>

        <Card className="max-w-lg mx-auto border-2 border-primary/20 shadow-xl bg-white">
          <CardContent className="p-8 md:p-10">
            {/* Free items */}
            <div className="space-y-4 mb-6">
              {freeItems.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-accent shrink-0" />
                  <span className="text-foreground font-medium">{item}</span>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Price */}
            <div className="text-center space-y-2 mb-6">
              <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                Manutenção mensal
              </p>
              <p className="text-4xl md:text-5xl font-bold text-primary">
                R$ 390
                <span className="text-lg font-normal text-muted-foreground">
                  /mês
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Único custo. Sem surpresas. Sem fidelidade.
              </p>
              <Badge
                variant="secondary"
                className="mt-2 bg-accent/10 text-accent border-accent/20"
              >
                Cancele quando quiser
              </Badge>
            </div>

            {/* CTA */}
            <a href="#contact">
              <Button size="lg" className="w-full">
                Começar agora — R$ 0 de entrada
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Comparison text */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Montar sozinho</strong> custa de
            R$ 5.000 a R$ 15.000 em equipe, ferramentas e infraestrutura.{" "}
            <strong className="text-foreground">Com a OfficeBiz</strong>, você
            começa com R$ 0 de entrada e paga apenas R$ 390/mês — com tudo
            incluso.
          </p>
        </div>
      </div>
    </section>
  );
}
