"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "O que é", href: "#what-is" },
  { label: "Serviços", href: "#services" },
  { label: "Como funciona", href: "#how-it-works" },
  { label: "Preço", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleScroll = () => setOpen(false);
    const handleResize = () => {
      if (window.innerWidth > 1080) setOpen(false);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [open]);

  return (
    <>
      <nav className="ds-nav">
        <Link href="/" className="ds-nav-brand" aria-label="OfficeBiz home">
          <Image
            src="/landing/images/officebiz-logo-white.png"
            alt="OfficeBiz"
            width={140}
            height={32}
            priority
          />
        </Link>

        <div className="ds-nav-links">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} className="ds-nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <Link href="/login" className="ds-nav-cta">
            Entrar
          </Link>
        </div>

        <button
          type="button"
          className="ds-mobile-toggle"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
          aria-expanded={open}
        >
          {open ? (
            <X size={20} strokeWidth={2} />
          ) : (
            <Menu size={20} strokeWidth={2} />
          )}
        </button>
      </nav>

      {open && (
        <div className="ds-mobile-menu" role="dialog" aria-label="Menu de navegação">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <Link href="/login" className="cta" onClick={() => setOpen(false)}>
            Entrar
          </Link>
        </div>
      )}
    </>
  );
}
