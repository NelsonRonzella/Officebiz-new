"use client";

import { motion } from "framer-motion";

export function GrowthIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 400 350"
        className="w-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background circle */}
        <circle cx="200" cy="175" r="140" fill="var(--color-primary, #22c55e)" opacity="0.04" />

        {/* Grid lines - hand drawn style */}
        <path d="M80 280 C82 278, 318 282, 320 280" stroke="currentColor" strokeWidth="1" opacity="0.08" className="text-foreground" strokeLinecap="round" />
        <path d="M80 240 C82 238, 318 242, 320 240" stroke="currentColor" strokeWidth="1" opacity="0.06" className="text-foreground" strokeLinecap="round" />
        <path d="M80 200 C82 198, 318 202, 320 200" stroke="currentColor" strokeWidth="1" opacity="0.06" className="text-foreground" strokeLinecap="round" />
        <path d="M80 160 C82 158, 318 162, 320 160" stroke="currentColor" strokeWidth="1" opacity="0.06" className="text-foreground" strokeLinecap="round" />
        <path d="M80 120 C82 118, 318 122, 320 120" stroke="currentColor" strokeWidth="1" opacity="0.06" className="text-foreground" strokeLinecap="round" />

        {/* Growth line - hand drawn curve */}
        <motion.path
          d="M90 260 C110 258, 130 250, 150 240 C170 230, 180 220, 200 200 C220 180, 230 170, 250 145 C270 120, 280 105, 300 80"
          stroke="var(--color-primary, #22c55e)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true }}
        />

        {/* Data points */}
        {[
          { cx: 90, cy: 260 },
          { cx: 150, cy: 240 },
          { cx: 200, cy: 200 },
          { cx: 250, cy: 145 },
          { cx: 300, cy: 80 },
        ].map((point, i) => (
          <motion.circle
            key={i}
            cx={point.cx}
            cy={point.cy}
            r="5"
            fill="white"
            stroke="var(--color-primary, #22c55e)"
            strokeWidth="2.5"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.3 }}
            viewport={{ once: true }}
          />
        ))}

        {/* Area fill under curve */}
        <path
          d="M90 260 C110 258, 130 250, 150 240 C170 230, 180 220, 200 200 C220 180, 230 170, 250 145 C270 120, 280 105, 300 80 L300 280 L90 280 Z"
          fill="url(#growth-fill)"
          opacity="0.12"
        />

        {/* Rocket */}
        <motion.g
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.g
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Rocket body */}
            <path
              d="M296 72 C298 60, 306 50, 310 44 C314 50, 322 60, 324 72 L320 78 L300 78 Z"
              fill="var(--color-primary, #22c55e)"
              opacity="0.8"
            />
            {/* Rocket window */}
            <circle cx="310" cy="62" r="4" fill="white" opacity="0.8" />
            {/* Rocket fins */}
            <path d="M296 72 L290 82 L300 78 Z" fill="var(--color-primary, #22c55e)" opacity="0.5" />
            <path d="M324 72 L330 82 L320 78 Z" fill="var(--color-primary, #22c55e)" opacity="0.5" />
            {/* Flame */}
            <path
              d="M305 78 C307 86, 310 92, 310 96 C310 92, 313 86, 315 78"
              fill="var(--color-warning, #f59e0b)"
              opacity="0.6"
            />
          </motion.g>
        </motion.g>

        {/* Small sparkle marks */}
        <motion.g
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          viewport={{ once: true }}
        >
          <path d="M330 60 L334 55 M336 62 L340 62 M332 68 L336 72" stroke="var(--color-primary, #22c55e)" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        </motion.g>

        {/* Labels */}
        <text x="85" y="298" fontSize="10" fill="currentColor" opacity="0.3" className="text-foreground" fontFamily="Inter, sans-serif">Jan</text>
        <text x="145" y="298" fontSize="10" fill="currentColor" opacity="0.3" className="text-foreground" fontFamily="Inter, sans-serif">Mar</text>
        <text x="195" y="298" fontSize="10" fill="currentColor" opacity="0.3" className="text-foreground" fontFamily="Inter, sans-serif">Mai</text>
        <text x="245" y="298" fontSize="10" fill="currentColor" opacity="0.3" className="text-foreground" fontFamily="Inter, sans-serif">Jul</text>
        <text x="293" y="298" fontSize="10" fill="currentColor" opacity="0.3" className="text-foreground" fontFamily="Inter, sans-serif">Set</text>

        <defs>
          <linearGradient id="growth-fill" x1="200" y1="80" x2="200" y2="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="var(--color-primary, #22c55e)" />
            <stop offset="100%" stopColor="var(--color-primary, #22c55e)" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
