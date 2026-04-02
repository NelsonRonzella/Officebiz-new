import type { Variants } from "framer-motion";

export const fadeInView = {
  initial: { opacity: 0, y: 20 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.5 } as const,
};

export function staggerContainer(stagger = 0.1): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger } },
  };
}

export function fadeInItem(
  direction: "y" | "x" = "y",
  offset = 20,
  duration = 0.4,
): Variants {
  return {
    hidden: Object.assign({ opacity: 0 }, { [direction]: direction === "x" ? -offset : offset }),
    visible: Object.assign({ opacity: 1, transition: { duration } }, { [direction]: 0 }),
  };
}
