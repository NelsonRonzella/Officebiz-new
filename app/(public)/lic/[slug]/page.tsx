import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const user = await db.user.findUnique({
    where: { slug },
    select: { companyName: true },
  })

  if (!user) return { title: "Não encontrado" }

  return {
    title: `${user.companyName || "Licenciado"} — OfficeBiz`,
  }
}

export default async function LicenciadoPublicPage({ params }: Props) {
  const { slug } = await params

  const licenciado = await db.user.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      companyName: true,
      companyLogo: true,
      brandPrimaryColor: true,
      brandAccentColor: true,
      active: true,
      telefone: true,
    },
  })

  if (!licenciado || !licenciado.active) {
    notFound()
  }

  const products = await db.product.findMany({
    where: { active: true },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      type: true,
    },
    orderBy: { createdAt: "asc" },
  })

  const primaryColor = licenciado.brandPrimaryColor || "#1E3A5F"
  const accentColor = licenciado.brandAccentColor || "#6366f1"

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header
        className="border-b px-4 py-6 text-center text-white"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="mx-auto max-w-3xl flex flex-col items-center gap-3">
          {licenciado.companyLogo && (
            <img
              src={licenciado.companyLogo}
              alt={licenciado.companyName || "Logo"}
              className="size-16 rounded-lg object-contain bg-white/10 p-1"
            />
          )}
          <h1 className="text-2xl font-bold">
            {licenciado.companyName || licenciado.name}
          </h1>
          <p className="text-sm opacity-80">
            Serviços empresariais via OfficeBiz
          </p>
        </div>
      </header>

      {/* Products */}
      <main className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">
          Nossos serviços
        </h2>

        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum serviço disponível no momento.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((product) => (
              <Card key={product.id}>
                <CardHeader>
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <span className="text-lg font-bold" style={{ color: primaryColor }}>
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(product.price))}
                  </span>
                  <span className="rounded-full px-2 py-0.5 text-xs font-medium border">
                    {product.type === "RECORRENTE" ? "Recorrente" : "Pontual"}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-4">
          <Link href="/login">
            <Button
              size="lg"
              style={{ backgroundColor: accentColor }}
              className="text-white hover:opacity-90"
            >
              Acessar minha conta
            </Button>
          </Link>
        </div>

        {licenciado.telefone && (
          <p className="text-center text-sm text-muted-foreground">
            Dúvidas? Entre em contato pelo WhatsApp
          </p>
        )}
      </main>
    </div>
  )
}
