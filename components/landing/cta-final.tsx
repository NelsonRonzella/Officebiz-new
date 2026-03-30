"use client";

import { useState } from "react";
import { Phone, ShieldCheck, Headphones, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const sourceOptions = [
  { value: "google", label: "Google" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "indicacao", label: "Indicação" },
  { value: "outro", label: "Outro" },
];

export function CtaFinal() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      source: formData.get("source") as string,
    };

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSubmitted(true);
    } catch {
      // Silently handle — could add error state
    } finally {
      setLoading(false);
    }
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Tenho interesse em ser licenciado OfficeBiz."
  )}`;

  return (
    <section id="contact" className="py-20 lg:py-28 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-10">
            Sem taxa de entrada. Sem risco. Sem burocracia.
          </p>

          {submitted ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Recebemos seu contato!
              </h3>
              <p className="text-primary-foreground/80">
                Nossa equipe entrará em contato em até 24 horas.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 space-y-5 text-left"
            >
              <div className="space-y-2">
                <Label htmlFor="name" className="text-primary-foreground">
                  Nome completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Seu nome"
                  className="bg-white/20 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-primary-foreground">
                  E-mail
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  className="bg-white/20 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-primary-foreground">
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  className="bg-white/20 border-white/20 text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="source" className="text-primary-foreground">
                  Como conheceu a OfficeBiz?
                </Label>
                <Select name="source" required>
                  <SelectTrigger className="bg-white/20 border-white/20 text-primary-foreground">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {sourceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? "Enviando..." : "Quero ser licenciado →"}
              </Button>
            </form>
          )}

          {/* WhatsApp alternative */}
          <div className="mt-8">
            <p className="text-sm text-primary-foreground/60 mb-3">
              Prefere falar diretamente?
            </p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-white/10"
              >
                <Phone className="w-4 h-4 mr-2" />
                Falar com um consultor no WhatsApp
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Badge
              variant="secondary"
              className="bg-white/10 text-primary-foreground border-white/20"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Cancele quando quiser
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/10 text-primary-foreground border-white/20"
            >
              <Headphones className="w-3 h-3 mr-1" />
              Suporte incluso
            </Badge>
            <Badge
              variant="secondary"
              className="bg-white/10 text-primary-foreground border-white/20"
            >
              <ShieldCheck className="w-3 h-3 mr-1" />
              Conexão segura SSL
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
}
