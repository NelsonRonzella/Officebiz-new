import Image from "next/image";

export function DashboardScroll() {
  return (
    <section className="ds-dash">
      <div className="ds-dash-stage">
        <div className="ds-dash-header">
          <span className="ds-eyebrow ds-eyebrow--light">Painel · Licenciado</span>
          <h2 className="ds-dash-title">Tudo num só painel.</h2>
          <p className="ds-dash-sub">
            Pedidos, faturamento e clientes em tempo real — pronto pra você operar com a sua marca.
          </p>
        </div>
        <div className="ds-dash-card">
          <div className="ds-dash-screen">
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
          </div>
        </div>
      </div>
    </section>
  );
}
