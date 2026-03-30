import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { WhatIs } from "@/components/landing/what-is";
import { Services } from "@/components/landing/services";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Advantages } from "@/components/landing/advantages";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CtaFinal } from "@/components/landing/cta-final";
import { Footer } from "@/components/landing/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";

export const metadata = {
  title: "OfficeBiz — Seu negócio de serviços empresariais sem investimento",
  description:
    "Plataforma completa + equipe de especialistas. Ofereça serviços empresariais com sua própria marca. Zero taxa de licença, zero setup, zero treinamento.",
};

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhatIs />
        <Services />
        <HowItWorks />
        <Advantages />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CtaFinal />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
