import Link from "next/link"
import { PageHeader } from "@/components/dashboard/page-header"
import { MessageCircle, Mail } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

const faqItems = [
  {
    question: "Como faço para criar um novo pedido?",
    answer:
      "Acesse a página de Pedidos e clique em 'Novo Pedido'. Selecione o cliente, o produto desejado e preencha as informações necessárias.",
  },
  {
    question: "Como funciona o período de teste?",
    answer:
      "Ao se cadastrar, você recebe 14 dias de acesso completo a todas as funcionalidades da plataforma. Após esse período, é necessário assinar o plano Pro para continuar utilizando.",
  },
  {
    question: "Como faço para acompanhar o andamento de um pedido?",
    answer:
      "Na página de Pedidos, clique no pedido desejado para ver todos os detalhes, etapas e mensagens relacionadas.",
  },
  {
    question: "Como altero meus dados de perfil?",
    answer:
      "Acesse Configurações > Perfil para atualizar suas informações pessoais, endereço e dados da empresa.",
  },
  {
    question: "Como funciona o plano Pro?",
    answer:
      "O plano Pro custa R$ 390/mês e dá acesso ilimitado a todas as funcionalidades: criação de pedidos, gestão de clientes, relatórios financeiros e muito mais.",
  },
]

export default function SuportePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader title="Suporte" description="Como podemos ajudar?" />

      {/* Contact Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* WhatsApp Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <MessageCircle className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle>WhatsApp</CardTitle>
                <CardDescription>
                  Converse com nosso time de suporte
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              render={
                <Link
                  href="https://wa.me/5500000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Abrir WhatsApp
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Atendimento: Seg a Sex, 9h às 18h
            </p>
          </CardFooter>
        </Card>

        {/* Email Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="size-5 text-primary" />
              </div>
              <div>
                <CardTitle>Email</CardTitle>
                <CardDescription>Envie sua dúvida por email</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              render={<Link href="mailto:suporte@officebiz.com.br" />}
            >
              Enviar Email
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Resposta em até 24h úteis
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Perguntas Frequentes
        </h2>
        <Accordion>
          {faqItems.map((item, index) => (
            <AccordionItem key={index} value={String(index)}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
