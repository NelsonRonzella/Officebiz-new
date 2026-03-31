import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProductTypeBadge } from "@/components/products/product-type-badge"
import { getYoutubeThumbnail } from "@/lib/youtube"
import {
  Clock,
  ExternalLink,
  FileText,
  PlayCircle,
} from "lucide-react"

interface ProductStep {
  id: string
  title: string
  description: string
  order: number
  durationDays: number
}

interface ProductDocumentCategory {
  id: string
  title: string
  description: string
  order: number
}

interface Tutorial {
  id: string
  title: string
  description: string
  link: string
}

interface TutorialProduct {
  tutorial: Tutorial
}

interface ProductData {
  id: string
  name: string
  description: string
  price: string
  type: string
  steps: ProductStep[]
  documentCategories: ProductDocumentCategory[]
  tutorials: TutorialProduct[]
}

interface ProductViewProps {
  product: ProductData
  showPrice: boolean
}

function formatPrice(value: string): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value))
}

export function ProductView({ product, showPrice }: ProductViewProps) {
  const sortedSteps = [...product.steps].sort((a, b) => a.order - b.order)
  const sortedCategories = [...product.documentCategories].sort(
    (a, b) => a.order - b.order
  )

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl">{product.name}</CardTitle>
              {showPrice && (
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </p>
              )}
            </div>
            <ProductTypeBadge type={product.type} />
          </div>
          <CardDescription className="mt-2 whitespace-pre-line">
            {product.description}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Steps (PONTUAL) */}
      {product.type === "PONTUAL" && sortedSteps.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Etapas do servico
          </h2>

          <div className="relative space-y-0">
            {sortedSteps.map((step, index) => (
              <div key={step.id} className="relative flex gap-4 pb-8 last:pb-0">
                {/* Vertical line */}
                {index < sortedSteps.length - 1 && (
                  <div className="absolute left-5 top-10 h-[calc(100%-2rem)] w-px bg-border" />
                )}

                {/* Number circle */}
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {step.order}
                </div>

                {/* Content */}
                <Card className="flex-1">
                  <CardHeader>
                    <CardTitle>{step.title}</CardTitle>
                    <CardDescription className="whitespace-pre-line">
                      {step.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Clock className="size-4" />
                      <span>
                        Prazo: {step.durationDays}{" "}
                        {step.durationDays === 1 ? "dia" : "dias"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Document Categories (RECORRENTE) */}
      {product.type === "RECORRENTE" && sortedCategories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Categorias de documentos
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {sortedCategories.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm font-bold text-secondary-foreground">
                      <FileText className="size-4" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle>{category.title}</CardTitle>
                      <CardDescription className="whitespace-pre-line">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tutorials */}
      {product.tutorials.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Tutoriais</h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {product.tutorials.map(({ tutorial }) => {
              const thumbnail = getYoutubeThumbnail(tutorial.link)

              return (
                <a
                  key={tutorial.id}
                  href={tutorial.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <Card className="transition-shadow group-hover:shadow-md">
                    {thumbnail && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
                        <Image
                          src={thumbnail}
                          alt={tutorial.title}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                          <PlayCircle className="size-12 text-white" />
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="line-clamp-1">
                            {tutorial.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {tutorial.description}
                          </CardDescription>
                        </div>
                        <ExternalLink className="size-4 shrink-0 text-muted-foreground" />
                      </div>
                    </CardHeader>
                  </Card>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
