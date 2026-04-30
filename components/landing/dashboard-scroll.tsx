"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";

export function DashboardScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = (): [number, number] => (isMobile ? [0.7, 0.9] : [1.05, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <section
      ref={containerRef}
      className="ds-dashboard-scroll h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-20"
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{ perspective: "1000px" }}
      >
        <Header translate={translate} />
        <Card rotate={rotate} scale={scale}>
          <BrowserMock />
        </Card>
      </div>
    </section>
  );
}

function Header({ translate }: { translate: MotionValue<number> }) {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="max-w-5xl mx-auto text-center px-4"
    >
      <span className="ds-eyebrow ds-eyebrow--light">Painel · Licenciado</span>
      <h2 className="ds-dashboard-scroll-title">
        Tudo num só painel.
      </h2>
      <p className="ds-dashboard-scroll-sub">
        Pedidos, faturamento e clientes em tempo real — pronto pra você operar com a sua marca.
      </p>
    </motion.div>
  );
}

function Card({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="ds-dashboard-scroll-card max-w-5xl -mt-12 mx-auto h-[30rem] md:h-[40rem] w-full p-2 md:p-4 rounded-[30px]"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-[#0d2410]">
        {children}
      </div>
    </motion.div>
  );
}

function BrowserMock() {
  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 bg-black/40 border-b border-white/10 flex-shrink-0">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 max-w-xs mx-auto px-4 py-1 rounded-full bg-white/5 text-xs text-white/60 text-center truncate">
          officebiz.com.br/dashboard
        </div>
        <div className="w-12 flex-shrink-0" />
      </div>
      <div className="flex-1 relative overflow-hidden">
        <Image
          src="/landing/features/dashboard.png"
          alt="Painel do licenciado da OfficeBiz"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="object-cover object-top"
          priority={false}
        />
      </div>
    </div>
  );
}
