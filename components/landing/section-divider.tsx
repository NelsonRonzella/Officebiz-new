export function SectionDivider({
  variant = "wave",
  flip = false,
  className = "",
}: {
  variant?: "wave" | "curve" | "slant";
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full overflow-hidden h-12 md:h-16 lg:h-20 ${flip ? "rotate-180" : ""} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        fill="none"
      >
        {variant === "wave" && (
          <path
            d="M0 40 C240 80 480 0 720 40 C960 80 1200 0 1440 40 L1440 80 L0 80 Z"
            className="fill-muted/30"
          />
        )}
        {variant === "curve" && (
          <path
            d="M0 60 C360 0 1080 0 1440 60 L1440 80 L0 80 Z"
            className="fill-muted/30"
          />
        )}
        {variant === "slant" && (
          <path
            d="M0 80 L1440 20 L1440 80 Z"
            className="fill-muted/30"
          />
        )}
      </svg>
    </div>
  );
}
