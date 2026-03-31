"use client";

import {
  DollarSign,
  TrendingUp,
  Users,
  Rocket,
  Tag,
  Headphones,
} from "lucide-react";
import { motion } from "framer-motion";
import { GrowthIllustration } from "@/components/illustrations/growth-illustration";

const advantages = [
  {
    icon: DollarSign,
    title: "Zero investimento",
    description:
      "Sem taxa de licenca, sem setup, sem treinamento. Comece sem gastar nada.",
  },
  {
    icon: TrendingUp,
    title: "Ganhe em cada venda",
    description:
      "Defina suas proprias margens. Quanto mais vende, mais lucra.",
  },
  {
    icon: Users,
    title: "Equipe inclusa",
    description:
      "Contadores, designers, desenvolvedores — todos prontos para executar.",
  },
  {
    icon: Rocket,
    title: "Escalavel",
    description:
      "Atenda 1 ou 1.000 clientes. A plataforma cresce com voce.",
  },
  {
    icon: Tag,
    title: "White-label",
    description:
      "Ofereca tudo com a sua marca. Seus clientes nem sabem que existimos.",
  },
  {
    icon: Headphones,
    title: "Suporte dedicado",
    description:
      "Canal direto com nossa equipe para duvidas e acompanhamento.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
};

export function Advantages() {
  return (
    <section id="advantages" className="py-20 lg:py-28">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <p className="text-sm font-medium text-primary tracking-wider uppercase mb-3">
            Vantagens exclusivas
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que ser um licenciado OfficeBiz?
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left — Benefits list */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {advantages.map((item) => (
              <motion.div
                key={item.title}
                variants={itemVariants}
                className="group flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-border hover:bg-muted/30 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right — Growth illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <GrowthIllustration className="w-full max-w-md mx-auto" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
