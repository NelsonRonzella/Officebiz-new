"use client";

import { motion } from "framer-motion";

export function HeroIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full max-w-lg mx-auto ${className}`}>
      {/* Background blob */}
      <svg
        viewBox="0 0 500 500"
        className="absolute inset-0 w-full h-full -z-10"
        fill="none"
      >
        <path
          d="M250 50 C350 30, 460 120, 450 230 C440 340, 370 450, 250 460 C130 470, 50 360, 40 250 C30 140, 150 70, 250 50z"
          fill="url(#hero-bg)"
          opacity="0.08"
        />
        <defs>
          <linearGradient id="hero-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-primary, #22c55e)" />
            <stop offset="100%" stopColor="var(--color-accent, #a3e635)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Main dashboard frame */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative"
      >
        <svg
          viewBox="0 0 420 300"
          className="w-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Browser window frame */}
          <rect
            x="10"
            y="10"
            width="400"
            height="280"
            rx="16"
            fill="white"
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="0.9"
            className="text-border"
          />
          {/* Title bar */}
          <rect x="10" y="10" width="400" height="36" rx="16" fill="var(--color-muted, #f1f5f9)" />
          <rect x="10" y="30" width="400" height="16" fill="var(--color-muted, #f1f5f9)" />
          {/* Traffic lights */}
          <circle cx="32" cy="28" r="5" fill="#ef4444" opacity="0.7" />
          <circle cx="50" cy="28" r="5" fill="#f59e0b" opacity="0.7" />
          <circle cx="68" cy="28" r="5" fill="#22c55e" opacity="0.7" />

          {/* Sidebar */}
          <rect x="10" y="46" width="80" height="244" fill="var(--color-primary, #22c55e)" opacity="0.1" />
          {/* Sidebar items */}
          <rect x="22" y="62" width="56" height="8" rx="4" fill="var(--color-primary, #22c55e)" opacity="0.4" />
          <rect x="22" y="82" width="48" height="6" rx="3" fill="currentColor" opacity="0.12" className="text-foreground" />
          <rect x="22" y="98" width="52" height="6" rx="3" fill="currentColor" opacity="0.12" className="text-foreground" />
          <rect x="22" y="114" width="44" height="6" rx="3" fill="currentColor" opacity="0.12" className="text-foreground" />
          <rect x="22" y="130" width="50" height="6" rx="3" fill="currentColor" opacity="0.12" className="text-foreground" />

          {/* Main content area - stat cards */}
          <rect x="104" y="58" width="88" height="52" rx="8" fill="white" stroke="var(--color-border, #e2e8f0)" strokeWidth="1" />
          <rect x="114" y="68" width="40" height="6" rx="3" fill="var(--color-primary, #22c55e)" opacity="0.3" />
          <rect x="114" y="82" width="60" height="12" rx="4" fill="var(--color-primary, #22c55e)" opacity="0.5" />
          <rect x="114" y="100" width="32" height="4" rx="2" fill="currentColor" opacity="0.1" className="text-foreground" />

          <rect x="200" y="58" width="88" height="52" rx="8" fill="white" stroke="var(--color-border, #e2e8f0)" strokeWidth="1" />
          <rect x="210" y="68" width="36" height="6" rx="3" fill="var(--color-accent, #a3e635)" opacity="0.3" />
          <rect x="210" y="82" width="55" height="12" rx="4" fill="var(--color-accent, #a3e635)" opacity="0.5" />
          <rect x="210" y="100" width="28" height="4" rx="2" fill="currentColor" opacity="0.1" className="text-foreground" />

          <rect x="296" y="58" width="88" height="52" rx="8" fill="white" stroke="var(--color-border, #e2e8f0)" strokeWidth="1" />
          <rect x="306" y="68" width="44" height="6" rx="3" fill="var(--color-warning, #f59e0b)" opacity="0.3" />
          <rect x="306" y="82" width="50" height="12" rx="4" fill="var(--color-warning, #f59e0b)" opacity="0.5" />
          <rect x="306" y="100" width="36" height="4" rx="2" fill="currentColor" opacity="0.1" className="text-foreground" />

          {/* Chart area */}
          <rect x="104" y="122" width="184" height="100" rx="8" fill="white" stroke="var(--color-border, #e2e8f0)" strokeWidth="1" />
          {/* Bar chart hand-drawn */}
          <path
            d="M124 200 L124 180 M144 200 L144 165 M164 200 L164 175 M184 200 L184 150 M204 200 L204 160 M224 200 L224 140 M244 200 L244 155 M264 200 L264 135"
            stroke="var(--color-primary, #22c55e)"
            strokeWidth="10"
            strokeLinecap="round"
            opacity="0.5"
          />
          {/* Chart title */}
          <rect x="114" y="130" width="60" height="6" rx="3" fill="currentColor" opacity="0.15" className="text-foreground" />

          {/* Table/list area */}
          <rect x="296" y="122" width="88" height="100" rx="8" fill="white" stroke="var(--color-border, #e2e8f0)" strokeWidth="1" />
          <rect x="306" y="134" width="68" height="5" rx="2.5" fill="currentColor" opacity="0.12" className="text-foreground" />
          <rect x="306" y="148" width="60" height="5" rx="2.5" fill="currentColor" opacity="0.08" className="text-foreground" />
          <rect x="306" y="162" width="64" height="5" rx="2.5" fill="currentColor" opacity="0.08" className="text-foreground" />
          <rect x="306" y="176" width="56" height="5" rx="2.5" fill="currentColor" opacity="0.08" className="text-foreground" />
          <rect x="306" y="190" width="62" height="5" rx="2.5" fill="currentColor" opacity="0.08" className="text-foreground" />

          {/* Bottom section */}
          <rect x="104" y="234" width="280" height="40" rx="8" fill="white" stroke="var(--color-border, #e2e8f0)" strokeWidth="1" />
          <rect x="116" y="248" width="80" height="6" rx="3" fill="currentColor" opacity="0.1" className="text-foreground" />
          <rect x="116" y="260" width="120" height="4" rx="2" fill="currentColor" opacity="0.06" className="text-foreground" />
        </svg>
      </motion.div>

      {/* Floating notification card */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="absolute -top-2 -right-4 md:-right-8"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white rounded-xl shadow-lg border border-border p-3 flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-foreground">+12 clientes</p>
            <p className="text-[8px] text-muted-foreground">este mes</p>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating revenue card */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        className="absolute -bottom-4 -left-4 md:-left-8"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg border border-border p-3 flex items-center gap-2.5"
        >
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-foreground">R$ 4.680</p>
            <p className="text-[8px] text-muted-foreground">receita mensal</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
