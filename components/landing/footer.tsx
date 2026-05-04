import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin } from "lucide-react";

const productLinks = [
  { label: "Serviços", href: "#services" },
  { label: "Como funciona", href: "#how-it-works" },
  { label: "Preço", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const companyLinks = [
  { label: "Política de Privacidade", href: "/privacy" },
  { label: "Termos de Uso", href: "/terms" },
  { label: "Contato", href: "#contact" },
];

const accountLinks = [
  { label: "Entrar", href: "/login" },
  { label: "Começar agora", href: "#pricing" },
];

export function Footer() {
  return (
    <footer className="ds-footer">
      <div className="ds-container">
        <div className="ds-footer-grid">
          <div className="ds-footer-brand">
            <Image
              src="/landing/images/officebiz-logo-white.png"
              alt="OfficeBiz"
              width={160}
              height={40}
            />
            <p>
              Plataforma white-label de serviços empresariais. Você gerencia, nossa equipe
              executa — tudo com a sua marca.
            </p>
            <div className="ds-footer-legal">
              <p>CNPJ: 52.269.695/0001-05</p>
              <p>
                Avenida Paulista, 777 — Andar 15, Conj. 15, Sala 990
                <br />
                Bela Vista · São Paulo — SP · 01311-100
              </p>
            </div>
          </div>

          <div>
            <h5>Produto</h5>
            <ul>
              {productLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>Empresa</h5>
            <ul>
              {companyLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5>Conta</h5>
            <ul>
              {accountLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="ds-footer-bottom">
          <span>
            &copy; 2026 OfficeBiz · Todos os direitos reservados · Powered by{" "}
            <strong>Zella Digital</strong>
          </span>
          <div className="socials">
            <a
              href="#"
              aria-label="Instagram"
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={16} strokeWidth={2} />
            </a>
            <a
              href="#"
              aria-label="LinkedIn"
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin size={16} strokeWidth={2} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
