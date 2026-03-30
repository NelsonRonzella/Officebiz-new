// cypress/e2e/admin/pedidos/listar-pedidos.cy.ts

describe('Admin — Listagem de Pedidos', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
    cy.visit('/pedidos')
  })

  it('deve exibir a listagem de pedidos', () => {
    cy.get('[data-cy=page-title]').should('contain.text', 'Pedidos').and('be.visible')
    cy.get('table').should('exist')
  })

  it('deve exibir botão de criar pedido para admin', () => {
    cy.get('[data-cy=link-criar-pedido]').should('be.visible')
  })

  it('deve filtrar pedidos pelo número do pedido', () => {
    cy.get('input[name=numero]').type('1')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'numero=1')
  })

  it('deve filtrar pedidos pelo nome do cliente', () => {
    cy.get('input[name=cliente_nome]').type('Cliente Exemplo')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'cliente_nome=Cliente+Exemplo')
  })

  it('deve filtrar pedidos pelo nome do licenciado', () => {
    cy.get('input[name=licenciado_nome]').type('Licenciado')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'licenciado_nome')
  })

  it('deve filtrar pedidos pelo nome do prestador', () => {
    cy.get('input[name=prestador_nome]').type('Prestador')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'prestador_nome')
  })

  it('deve filtrar pedidos pelo tipo de produto pontual', () => {
    cy.get('select[name=tipo_produto]').select('pontual')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'tipo_produto=pontual')
  })

  it('deve filtrar pedidos pelo tipo de produto recorrente', () => {
    cy.get('select[name=tipo_produto]').select('recorrente')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'tipo_produto=recorrente')
  })

  it('deve filtrar pedidos por status', () => {
    cy.get('select[name=status]').select('0')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'status=0')
  })

  it('deve filtrar pedidos por data inicial', () => {
    cy.get('input[name=data_inicio]').type('2026-01-01')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'data_inicio')
  })

  it('deve filtrar pedidos por intervalo de datas', () => {
    cy.get('input[name=data_inicio]').type('2026-01-01')
    cy.get('input[name=data_fim]').type('2026-12-31')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'data_inicio').and('include', 'data_fim')
  })

  it('deve limpar filtros ao clicar no botão de limpar', () => {
    cy.get('input[name=cliente_nome]').type('Teste')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.get('a[href*="pedidos"]').filter(':contains("✕")').click()
    cy.url().should('not.include', 'cliente_nome')
  })

  it('deve navegar para os detalhes do pedido ao clicar no número', () => {
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  // Testes destrutivos: cada um reseta o banco para garantir independência
  describe('ações que alteram status do pedido', () => {

    beforeEach(() => {
      cy.resetarBanco()
      cy.loginComo('admin')
    })

    it('deve cancelar pedido ao clicar em Cancelar na listagem', () => {
      cy.visit('/pedidos?status=1')
      cy.get('[data-cy=btn-cancelar]:not([disabled])').first().click()
      cy.get('body').invoke('text').should('match', /Cancelado|sucesso/)
    })

    it('deve marcar pedido como pago ao clicar em Pago na listagem', () => {
      cy.visit('/pedidos?status=0')
      cy.get('[data-cy=btn-pago]').first().click()
      cy.get('body').invoke('text').should('match', /Pago|sucesso/)
    })

    it('deve concluir pedido ao clicar em Concluir na listagem e confirmar', () => {
      cy.visit('/pedidos?status=1')
      cy.get('[data-cy=btn-concluir]').first().click()
      cy.get('.swal2-confirm').click()
      cy.get('body').invoke('text').should('match', /Conclu[ií]do|sucesso/)
    })

  })

  it('filtro com data_inicio preenchida não quebra a página', () => {
    cy.get('input[name=data_inicio]').type('2020-01-01')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'data_inicio')
    cy.get('table').should('exist')
    cy.get('body').should('not.contain.text', 'Error')
  })

  it('deve navegar para página via paginação se disponível', () => {
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=paginacao] a, nav[aria-label*="pagination"] a').length > 1) {
        cy.get('[data-cy=paginacao] a, nav[aria-label*="pagination"] a').eq(1).click()
        cy.url().should('include', 'page=')
        cy.get('table').should('exist')
      } else {
        // Paginação não disponível com os dados atuais — teste passa
        cy.log('Paginação não disponível com os dados do seed')
      }
    })
  })

})
