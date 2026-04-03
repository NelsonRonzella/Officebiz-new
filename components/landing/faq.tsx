import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Preciso ter CNPJ para ser licenciado?",
    answer:
      "Não! Você pode começar como pessoa física. Quando estiver pronto, podemos ajudar você a abrir seu CNPJ — inclusive esse é um dos serviços da plataforma.",
  },
  {
    question: "Preciso montar uma equipe?",
    answer:
      "Não. Toda a execução dos serviços é feita pela equipe da OfficeBiz. Você só precisa focar em captar clientes e fazer os pedidos pelo painel.",
  },
  {
    question: "Como eu ganho dinheiro?",
    answer:
      "Você define o preço que cobra dos seus clientes. A diferença entre o que você cobra e o custo do serviço na plataforma é o seu lucro. Simples assim.",
  },
  {
    question: "Tem contrato de fidelidade?",
    answer:
      "Não. Você pode cancelar a qualquer momento, sem multa e sem burocracia. Acreditamos que você fica porque quer, não porque é obrigado.",
  },
  {
    question: "Quanto custa para começar?",
    answer:
      "Zero. Não há taxa de licença, nem de setup, nem de treinamento. O único custo é a manutenção mensal de R$ 390/mês, que cobre toda a infraestrutura e equipe.",
  },
  {
    question: "Posso usar minha própria marca?",
    answer:
      "Sim! O modelo é 100% white-label. Seus clientes interagem com a sua marca. A OfficeBiz opera nos bastidores.",
  },
  {
    question: "Preciso ter experiência na área?",
    answer:
      "Não. Oferecemos treinamento e materiais de apoio. Além disso, a equipe de especialistas cuida de toda a parte técnica dos serviços.",
  },
  {
    question: "Quantos clientes posso atender?",
    answer:
      "Não há limite. A plataforma é escalável e cresce com o seu negócio. Quanto mais clientes você tiver, maior o seu faturamento.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 lg:py-28 bg-surface">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="max-w-2xl mx-auto">
          <Accordion className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-border rounded-lg bg-card px-4 sm:px-6"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
