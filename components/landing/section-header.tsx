"use client"

import { motion } from "framer-motion"
import { fadeInView } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  subtitle?: string
  title: string
  description?: string
  animated?: boolean
  className?: string
}

export function SectionHeader({ subtitle, title, description, animated = true, className }: SectionHeaderProps) {
  const Wrapper = animated ? motion.div : "div"
  const wrapperProps = animated ? fadeInView : {}

  return (
    <Wrapper {...wrapperProps} className={cn("text-center mb-16", className)}>
      {subtitle && (
        <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
          {subtitle}
        </p>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </Wrapper>
  )
}
