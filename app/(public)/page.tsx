import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { DashboardScroll } from "@/components/landing/dashboard-scroll";
import { WhatIs } from "@/components/landing/what-is";
import { Services } from "@/components/landing/services";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Advantages } from "@/components/landing/advantages";
import { Pricing } from "@/components/landing/pricing";
import { Competitors } from "@/components/landing/competitors";
import { Testimonials } from "@/components/landing/testimonials";
import { FAQ } from "@/components/landing/faq";
import { CtaFinal } from "@/components/landing/cta-final";
import { Footer } from "@/components/landing/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getConnectedWhatsappUrl } from "@/lib/evolution-instance";

export const metadata = {
  title: "OfficeBiz — Seu negócio de serviços empresariais sem investimento",
  description:
    "Plataforma completa + equipe de especialistas. Ofereça serviços empresariais com sua própria marca. Zero taxa de licença, zero setup, zero treinamento.",
};

export default async function LandingPage() {
  const whatsappUrl = await getConnectedWhatsappUrl();
  return (
    <div className="ds-scope">
      <Navbar />
      <main>
        <Hero />
        <DashboardScroll />
        <WhatIs />
        <Services />
        <Features />
        <HowItWorks />
        <Advantages />
        <Pricing whatsappUrl={whatsappUrl} />
        <Competitors />
        <Testimonials />
        <FAQ />
        <CtaFinal whatsappUrl={whatsappUrl} />
      </main>
      <Footer />
      <WhatsAppButton whatsappUrl={whatsappUrl} />
    </div>
  );
}
