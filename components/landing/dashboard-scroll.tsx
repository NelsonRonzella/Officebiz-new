"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";

export function DashboardScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start 0.2"],
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const scaleDimensions = (): [number, number] => (isMobile ? [0.75, 1] : [0.9, 1]);

  const rotate = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <section ref={containerRef} className="ds-dash">
      <div className="ds-dash-stage">
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
    <motion.div style={{ translateY: translate }} className="ds-dash-header">
      <span className="ds-eyebrow ds-eyebrow--light">Painel · Licenciado</span>
      <h2 className="ds-dash-title">Tudo num só painel.</h2>
      <p className="ds-dash-sub">
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
      style={{ rotateX: rotate, scale }}
      className="ds-dash-card"
    >
      <div className="ds-dash-screen">{children}</div>
    </motion.div>
  );
}

function BrowserMock() {
  return (
    <div className="ds-dash-mock">
      <div className="ds-dash-bar">
        <div className="ds-dash-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="ds-dash-url">officebiz.com.br/dashboard</div>
        <div className="ds-dash-actions" aria-hidden />
      </div>
      <div className="ds-dash-image">
        <Image
          src="/landing/features/dashboard.png"
          alt="Painel do licenciado da OfficeBiz"
          fill
          sizes="(max-width: 1280px) 100vw, 1280px"
          className="ds-dash-img"
          priority={false}
        />
      </div>
    </div>
  );
}
