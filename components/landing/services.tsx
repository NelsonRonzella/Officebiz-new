"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import {
  CnpjIllustration,
  ContabilidadeIllustration,
  MarcaIllustration,
  LogoIllustration,
  PapelariaIllustration,
  SiteIllustration,
  EmailIllustration,
  CartaoVirtualIllustration,
} from "@/components/illustrations/service-illustrations";
import { fadeInView, staggerContainer, fadeInItem } from "@/lib/motion";

const services = [
  {
    Illustration: CnpjIllustration,
    title: "Abertura de CNPJ",
    description:
      "MEI, ME, EPP — todo o processo de formalização empresarial simplificado.",
    featured: true,
  },
  {
    Illustration: ContabilidadeIllustration,
    title: "Contabilidade",
    description:
      "Escrituração, impostos, folha de pagamento e obrigações acessórias.",
    featured: true,
  },
  {
    Illustration: MarcaIllustration,
    title: "Registro de Marca",
    description:
      "Pesquisa de anterioridade e registro junto ao INPI com acompanhamento.",
    featured: false,
  },
  {
    Illustration: LogoIllustration,
    title: "Logotipos",
    description:
      "Criação de identidade visual profissional com manual de marca.",
    featured: false,
  },
  {
    Illustration: PapelariaIllustration,
    title: "Papelaria",
    description:
      "Cartões de visita, papel timbrado, envelopes e materiais impressos.",
    featured: false,
  },
  {
    Illustration: SiteIllustration,
    title: "Sites",
    description:
      "Sites institucionais e landing pages otimizadas para conversão.",
    featured: false,
  },
  {
    Illustration: EmailIllustration,
    title: "E-mail e Domínios",
    description:
      "Registro de domínio e configuração de e-mail profissional.",
    featured: false,
  },
  {
    Illustration: CartaoVirtualIllustration,
    title: "Cartão Virtual",
    description:
      "Cartão de visita digital interativo com QR Code e link compartilhável.",
    featured: false,
  },
];

const containerVariants = staggerContainer(0.08);
const itemVariants = fadeInItem("y", 20, 0.4);

export function Services() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
              Portfólio completo
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Serviços que você pode oferecer aos seus clientes
            </h2>
            <p className="text-lg text-muted-foreground">
              Um portfólio completo, pronto para revenda. Sem precisar de equipe
              própria.
            </p>
          </motion.div>
        </div>

        {/* Bento grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className={service.featured ? "sm:col-span-2 lg:col-span-2" : ""}
            >
              <Card
                className={`group relative overflow-hidden border border-border/60 bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full ${
                  service.featured ? "bg-gradient-to-br from-primary/[0.03] to-transparent" : ""
                }`}
              >
                <CardContent className={`flex ${service.featured ? "flex-row items-center gap-6 p-8" : "flex-col items-start gap-4 p-6"}`}>
                  <div
                    className={`shrink-0 ${
                      service.featured ? "w-24 h-24" : "w-16 h-16"
                    }`}
                  >
                    <service.Illustration className="w-full h-full" />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-foreground mb-1.5 ${service.featured ? "text-lg" : ""}`}>
                      {service.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </CardContent>
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
