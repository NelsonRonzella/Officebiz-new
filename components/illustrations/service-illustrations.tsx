import type { SVGProps } from "react";

type IllustrationProps = SVGProps<SVGSVGElement> & { className?: string };

function IllustrationBase({ children, className = "", ...props }: IllustrationProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function CnpjIllustration(props: IllustrationProps) {
  return (
    <IllustrationBase {...props}>
      {/* Building */}
      <rect x="20" y="22" width="40" height="42" rx="4" fill="var(--color-primary, #22c55e)" opacity="0.12" />
      <rect x="20" y="22" width="40" height="42" rx="4" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      {/* Windows */}
      <rect x="28" y="32" width="8" height="8" rx="1.5" fill="var(--color-primary, #22c55e)" opacity="0.3" />
      <rect x="44" y="32" width="8" height="8" rx="1.5" fill="var(--color-primary, #22c55e)" opacity="0.3" />
      <rect x="28" y="46" width="8" height="8" rx="1.5" fill="var(--color-primary, #22c55e)" opacity="0.3" />
      <rect x="44" y="46" width="8" height="8" rx="1.5" fill="var(--color-primary, #22c55e)" opacity="0.3" />
      {/* Door */}
      <rect x="36" y="52" width="8" height="12" rx="1.5" fill="var(--color-primary, #22c55e)" opacity="0.5" />
      {/* Flag */}
      <path d="M40 14 L40 22" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M40 14 L52 18 L40 22" fill="var(--color-primary, #22c55e)" opacity="0.25" />
      {/* Checkmark badge */}
      <circle cx="58" cy="20" r="8" fill="var(--color-primary, #22c55e)" opacity="0.2" />
      <path d="M54 20 L57 23 L63 17" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
    </IllustrationBase>
  );
}

export function ContabilidadeIllustration(props: IllustrationProps) {
  return (
    <IllustrationBase {...props}>
      {/* Calculator body */}
      <rect x="18" y="16" width="32" height="48" rx="4" fill="var(--color-primary, #22c55e)" opacity="0.12" />
      <rect x="18" y="16" width="32" height="48" rx="4" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* Screen */}
      <rect x="22" y="20" width="24" height="12" rx="2" fill="var(--color-primary, #22c55e)" opacity="0.15" />
      <text x="38" y="30" fontSize="8" fontFamily="monospace" textAnchor="end" fill="var(--color-primary, #22c55e)" opacity="0.6">1,250</text>
      {/* Keys */}
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={24 + col * 8}
            y={36 + row * 8}
            width="6"
            height="6"
            rx="1"
            fill="var(--color-primary, #22c55e)"
            opacity="0.2"
          />
        ))
      )}
      {/* Chart floating card */}
      <rect x="42" y="24" width="24" height="28" rx="4" fill="white" stroke="var(--color-border, #e2e8f0)" strokeWidth="1.5" />
      <path d="M48 44 L48 38 M54 44 L54 34 M60 44 L60 36" stroke="var(--color-primary, #22c55e)" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      <rect x="46" y="28" width="16" height="3" rx="1.5" fill="currentColor" opacity="0.1" className="text-foreground" />
    </IllustrationBase>
  );
}

export function MarcaIllustration(props: IllustrationProps) {
  return (
    <IllustrationBase {...props}>
      {/* Shield */}
      <path
        d="M40 12 L58 22 L58 42 C58 52 50 60 40 66 C30 60 22 52 22 42 L22 22 Z"
        fill="var(--color-primary, #22c55e)"
        opacity="0.1"
        stroke="var(--color-primary, #22c55e)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Star inside */}
      <path
        d="M40 26 L43 34 L52 35 L46 41 L47 50 L40 46 L33 50 L34 41 L28 35 L37 34 Z"
        fill="var(--color-primary, #22c55e)"
        opacity="0.3"
      />
      {/* TM mark */}
      <text x="62" y="18" fontSize="8" fontWeight="bold" fill="var(--color-primary, #22c55e)" opacity="0.4">TM</text>
    </IllustrationBase>
  );
}

export function LogoIllustration(props: IllustrationProps) {
  return (
    <IllustrationBase {...props}>
      {/* Canvas/artboard */}
      <rect x="14" y="18" width="52" height="44" rx="4" fill="var(--color-primary, #22c55e)" opacity="0.08" />
      <rect x="14" y="18" width="52" height="44" rx="4" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      {/* Abstract logo shape */}
      <circle cx="36" cy="36" r="10" fill="var(--color-primary, #22c55e)" opacity="0.25" />
      <circle cx="44" cy="36" r="10" fill="var(--color-primary, #22c55e)" opacity="0.2" />
      <rect x="32" y="50" width="16" height="4" rx="2" fill="currentColor" opacity="0.12" className="text-foreground" />
      {/* Pen tool */}
      <path d="M58 14 L62 18 L52 28 L48 24 Z" fill="var(--color-primary, #22c55e)" opacity="0.4" />
      <path d="M48 24 L46 30 L52 28" fill="var(--color-primary, #22c55e)" opacity="0.3" />
    </IllustrationBase>
  );
}

export function PapelariaIllustration(props: IllustrationProps) {
  return (
    <IllustrationBase {...props}>
      {/* Stacked papers */}
      <rect x="22" y="22" width="36" height="44" rx="3" fill="var(--color-primary, #22c55e)" stroke="var(--color-primary, #22c55e)" strokeWidth="1.5" opacity="0.15" transform="rotate(3 40 44)" />
      <rect x="20" y="18" width="36" height="44" rx="3" fill="white" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* Text lines */}
      <rect x="26" y="26" width="24" height="3" rx="1.5" fill="var(--color-primary, #22c55e)" opacity="0.25" />
      <rect x="26" y="34" width="20" height="2" rx="1" fill="currentColor" opacity="0.1" className="text-foreground" />
      <rect x="26" y="40" width="22" height="2" rx="1" fill="currentColor" opacity="0.1" className="text-foreground" />
      <rect x="26" y="46" width="18" height="2" rx="1" fill="currentColor" opacity="0.1" className="text-foreground" />
      {/* Business card floating */}
      <rect x="44" y="40" width="22" height="14" rx="2" fill="white" stroke="var(--color-border, #e2e8f0)" strokeWidth="1.5" />
      <rect x="48" y="44" width="14" height="2" rx="1" fill="var(--color-primary, #22c55e)" opacity="0.35" />
      <rect x="48" y="48" width="10" height="2" rx="1" fill="currentColor" opacity="0.1" className="text-foreground" />
    </IllustrationBase>
  );
}

export function SiteIllustration(props: IllustrationProps) {
  return (
    <IllustrationBase {...props}>
      {/* Browser */}
      <rect x="12" y="16" width="56" height="48" rx="4" fill="white" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* Browser bar */}
      <rect x="12" y="16" width="56" height="12" rx="4" fill="var(--color-primary, #22c55e)" opacity="0.1" />
      <rect x="12" y="24" width="56" height="4" fill="var(--color-primary, #22c55e)" opacity="0.1" />
      <circle cx="22" cy="22" r="2" fill="#ef4444" opacity="0.5" />
      <circle cx="30" cy="22" r="2" fill="#f59e0b" opacity="0.5" />
      <circle cx="38" cy="22" r="2" fill="#22c55e" opacity="0.5" />
      {/* Content */}
      <rect x="18" y="34" width="24" height="4" rx="2" fill="var(--color-primary, #22c55e)" opacity="0.3" />
      <rect x="18" y="42" width="20" height="2" rx="1" fill="currentColor" opacity="0.1" className="text-foreground" />
      <rect x="18" y="48" width="16" height="2" rx="1" fill="currentColor" opacity="0.1" className="text-foreground" />
      {/* Image placeholder */}
      <rect x="46" y="34" width="16" height="16" rx="2" fill="var(--color-primary, #22c55e)" opacity="0.1" />
      {/* CTA button */}
      <rect x="18" y="54" width="16" height="6" rx="3" fill="var(--color-primary, #22c55e)" opacity="0.35" />
    </IllustrationBase>
  );
}

export function EmailIllustration(props: IllustrationProps) {
  return (
    <IllustrationBase {...props}>
      {/* Envelope */}
      <rect x="14" y="24" width="52" height="36" rx="4" fill="var(--color-primary, #22c55e)" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      {/* Flap */}
      <path d="M14 28 L40 46 L66 28" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
      {/* @ symbol floating */}
      <circle cx="58" cy="20" r="9" fill="white" stroke="var(--color-primary, #22c55e)" strokeWidth="1.5" opacity="0.6" />
      <text x="58" y="24" fontSize="10" fontWeight="bold" textAnchor="middle" fill="var(--color-primary, #22c55e)" opacity="0.5">@</text>
      {/* Notification dot */}
      <circle cx="62" cy="14" r="4" fill="var(--color-primary, #22c55e)" opacity="0.5" />
    </IllustrationBase>
  );
}

export function CartaoVirtualIllustration(props: IllustrationProps) {
  return (
    <IllustrationBase {...props}>
      {/* Phone */}
      <rect x="22" y="10" width="28" height="52" rx="6" fill="var(--color-primary, #22c55e)" stroke="var(--color-primary, #22c55e)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      {/* Screen */}
      <rect x="26" y="18" width="20" height="36" rx="2" fill="white" opacity="0.9" />
      {/* Avatar */}
      <circle cx="36" cy="28" r="5" fill="var(--color-primary, #22c55e)" opacity="0.25" />
      {/* Name */}
      <rect x="30" y="36" width="12" height="2" rx="1" fill="var(--color-primary, #22c55e)" opacity="0.3" />
      <rect x="31" y="40" width="10" height="1.5" rx="0.75" fill="currentColor" opacity="0.1" className="text-foreground" />
      {/* Social icons */}
      <circle cx="32" cy="48" r="2" fill="var(--color-primary, #22c55e)" opacity="0.2" />
      <circle cx="40" cy="48" r="2" fill="var(--color-primary, #22c55e)" opacity="0.2" />
      {/* QR code floating */}
      <rect x="52" y="30" width="18" height="18" rx="3" fill="white" stroke="var(--color-border, #e2e8f0)" strokeWidth="1.5" />
      {/* QR pattern */}
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect
            key={`qr-${row}-${col}`}
            x={55 + col * 3}
            y={33 + row * 3}
            width="2.5"
            height="2.5"
            fill="var(--color-primary, #22c55e)"
            opacity={(row + col) % 2 === 0 ? 0.5 : 0.15}
          />
        ))
      )}
    </IllustrationBase>
  );
}

export const serviceIllustrations = {
  "Abertura de CNPJ": CnpjIllustration,
  Contabilidade: ContabilidadeIllustration,
  "Registro de Marca": MarcaIllustration,
  Logotipos: LogoIllustration,
  Papelaria: PapelariaIllustration,
  Sites: SiteIllustration,
  "E-mail e Domínios": EmailIllustration,
  "Cartão Virtual": CartaoVirtualIllustration,
} as const;
