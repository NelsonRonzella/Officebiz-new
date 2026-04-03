import { cn } from "@/lib/utils"

interface SectionProps {
  id?: string
  children: React.ReactNode
  className?: string
  background?: "default" | "muted" | "surface"
  compact?: boolean
}

export function Section({ id, children, className, background = "default", compact = false }: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative overflow-hidden",
        compact ? "py-12" : "py-20 lg:py-28",
        background === "muted" && "bg-muted/30",
        background === "surface" && "bg-surface",
        className
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        {children}
      </div>
    </section>
  )
}
