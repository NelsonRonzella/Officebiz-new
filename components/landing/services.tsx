import {
  Building2,
  BarChart3,
  ShieldCheck,
  Palette,
  FileText,
  Globe,
  Mail,
  Smartphone,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const services = [
  {
    icon: Building2,
    title: "Abertura de CNPJ",
    description:
      "MEI, ME, EPP — todo o processo de formalização empresarial simplificado.",
  },
  {
    icon: BarChart3,
    title: "Contabilidade",
    description:
      "Escrituração, impostos, folha de pagamento e obrigações acessórias.",
  },
  {
    icon: ShieldCheck,
    title: "Registro de Marca",
    description:
      "Pesquisa de anterioridade e registro junto ao INPI com acompanhamento.",
  },
  {
    icon: Palette,
    title: "Logotipos",
    description:
      "Criação de identidade visual profissional com manual de marca.",
  },
  {
    icon: FileText,
    title: "Papelaria",
    description:
      "Cartões de visita, papel timbrado, envelopes e materiais impressos.",
  },
  {
    icon: Globe,
    title: "Sites",
    description:
      "Sites institucionais e landing pages otimizadas para conversão.",
  },
  {
    icon: Mail,
    title: "E-mail e Domínios",
    description:
      "Registro de domínio e configuração de e-mail profissional.",
  },
  {
    icon: Smartphone,
    title: "Cartão Virtual",
    description:
      "Cartão de visita digital interativo com QR Code e link compartilhável.",
  },
];

export function Services() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-surface">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Serviços que você pode oferecer aos seus clientes
          </h2>
          <p className="text-lg text-muted-foreground">
            Um portfólio completo, pronto para revenda. Sem precisar de equipe
            própria.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card
              key={service.title}
              className="group border border-border bg-white hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
            >
              <CardContent className="p-6 flex flex-col items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
