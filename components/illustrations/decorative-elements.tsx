export function GradientBlob({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M321.8 71.2c55.7 14.3 113.5 42.7 146.5 90.5 33 47.8 41.2 115 27.5 172.5-13.7 57.5-49.3 105.3-95 141.7-45.7 36.3-101.5 61.3-157.3 58.8-55.8-2.5-111.7-32.5-149-78.2-37.3-45.7-56-107-48.3-165.3 7.7-58.3 41.7-113.7 89.2-150.8C182.8 103.2 266.2 56.8 321.8 71.2z"
        fill="url(#blob-gradient)"
        opacity="0.12"
      />
      <defs>
        <linearGradient id="blob-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary, #22c55e)" />
          <stop offset="100%" stopColor="var(--color-accent, #a3e635)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function GradientBlobAlt({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 600"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M420.5 108.5c50.2 35.7 78.8 99.2 82.5 162.2 3.7 63-17.5 125.5-57 170.2-39.5 44.7-97.3 71.5-157.5 72.5-60.2 1-123-23.8-163.5-68.5-40.5-44.7-58.8-109.3-48.2-168.5 10.7-59.2 50.3-112.8 101.2-146.5C229.2 96.2 370.3 72.8 420.5 108.5z"
        fill="url(#blob-gradient-alt)"
        opacity="0.08"
      />
      <defs>
        <linearGradient id="blob-gradient-alt" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--color-primary, #22c55e)" />
          <stop offset="50%" stopColor="var(--color-secondary, #64748b)" />
          <stop offset="100%" stopColor="var(--color-accent, #a3e635)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const FLOATING_DOTS = [
  { cx: 20, cy: 30, r: 3 },
  { cx: 60, cy: 10, r: 2 },
  { cx: 100, cy: 45, r: 4 },
  { cx: 140, cy: 20, r: 2.5 },
  { cx: 180, cy: 35, r: 3 },
  { cx: 40, cy: 80, r: 2 },
  { cx: 90, cy: 100, r: 3.5 },
  { cx: 150, cy: 85, r: 2 },
  { cx: 30, cy: 150, r: 2.5 },
  { cx: 80, cy: 170, r: 3 },
  { cx: 130, cy: 140, r: 2 },
  { cx: 170, cy: 165, r: 4 },
];

export function FloatingDots({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {FLOATING_DOTS.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={dot.r}
          fill="currentColor"
          opacity={0.15 + (i % 3) * 0.08}
        />
      ))}
    </svg>
  );
}

export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 20"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10 C20 0, 40 20, 60 10 C80 0, 100 20, 120 10 C140 0, 160 20, 180 10 C190 5, 195 8, 200 10"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.2"
      />
    </svg>
  );
}

export function HandDrawnArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 14 C20 10, 50 16, 80 12 C90 11, 100 10, 108 12"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M100 6 L110 12 L100 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SparkleStars({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 4-point star */}
      <path
        d="M50 5 L54 42 L90 50 L54 58 L50 95 L46 58 L10 50 L46 42 Z"
        fill="currentColor"
        opacity="0.12"
      />
      {/* Small stars */}
      <path
        d="M20 15 L22 22 L28 24 L22 26 L20 33 L18 26 L12 24 L18 22 Z"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M78 70 L80 76 L86 78 L80 80 L78 86 L76 80 L70 78 L76 76 Z"
        fill="currentColor"
        opacity="0.1"
      />
    </svg>
  );
}
