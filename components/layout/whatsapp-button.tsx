"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Gostaria de saber mais sobre a OfficeBiz."
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      {/* Tooltip */}
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 text-xs font-medium text-white bg-foreground rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Fale conosco
      </span>

      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Fale conosco pelo WhatsApp"
        className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-pulse hover:animate-none"
      >
        <MessageCircle className="w-6 h-6" />
      </a>
    </div>
  );
}
