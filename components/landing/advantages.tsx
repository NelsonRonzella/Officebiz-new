import {
  DollarSign,
  TrendingUp,
  Users,
  Rocket,
  Tag,
  Headphones,
} from "lucide-react";

const advantages = [
  {
    icon: DollarSign,
    title: "Zero investimento",
    description:
      "Sem taxa de licença, sem setup, sem treinamento. Comece sem gastar nada.",
  },
  {
    icon: TrendingUp,
    title: "Ganhe em cada venda",
    description:
      "Defina suas próprias margens. Quanto mais vende, mais lucra.",
  },
  {
    icon: Users,
    title: "Equipe inclusa",
    description:
      "Contadores, designers, desenvolvedores — todos prontos para executar.",
  },
  {
    icon: Rocket,
    title: "Escalável",
    description:
      "Atenda 1 ou 1.000 clientes. A plataforma cresce com você.",
  },
  {
    icon: Tag,
    title: "White-label",
    description:
      "Ofereça tudo com a sua marca. Seus clientes nem sabem que existimos.",
  },
  {
    icon: Headphones,
    title: "Suporte dedicado",
    description:
      "Canal direto com nossa equipe para dúvidas e acompanhamento.",
  },
];

export function Advantages() {
  return (
    <section id="advantages" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que ser um licenciado OfficeBiz?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {advantages.map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <item.icon className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
