// cypress/e2e/admin/dashboard.cy.ts

describe('Admin — Dashboard', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
  })

  it('deve exibir a página do dashboard', () => {
    cy.visit('/dashboard')
    cy.url().should('include', '/dashboard')
    cy.get('body').should('be.visible')
  })

  it('deve exibir cards de status dos pedidos', () => {
    cy.visit('/dashboard')
    cy.contains('Aguardando pagamento').should('exist')
    cy.contains('Pedidos andamento').should('exist')
  })

  it('deve exibir pedidos pendentes de pagamento na tabela', () => {
    cy.visit('/dashboard')
    cy.get('table, [data-cy=tabela-pedidos]').should('exist')
    cy.get('body').invoke('text').should('match', /Aguardando|Pendente/)
  })

  it('deve navegar para detalhes ao clicar em pedido pendente', () => {
    cy.visit('/dashboard')
    cy.get('table tbody tr, [data-cy=tabela-pedidos] tr').first().find('a').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve exibir os gráficos na página do dashboard', () => {
    cy.visit('/dashboard')
    cy.get('canvas').should('exist')
  })

  it('licenciado é redirecionado ao tentar acessar /dashboard', () => {
    cy.loginComo('licenciado')
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.url().should('not.include', '/dashboard').and('include', '/pedidos')
  })

  it('cliente é redirecionado ao tentar acessar /dashboard', () => {
    cy.loginComo('cliente')
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.url().should('not.include', '/dashboard').and('include', '/pedidos')
  })

  it('prestador é redirecionado ao tentar acessar /dashboard', () => {
    cy.loginComo('prestador')
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.url().should('not.include', '/dashboard').and('include', '/pedidos')
  })

})
