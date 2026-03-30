// cypress/e2e/admin/financeiro.cy.ts

describe('Admin — Financeiro', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
    cy.visit('/financeiro')
  })

  it('deve exibir a página de financeiro', () => {
    cy.contains('Financeiro').should('be.visible')
    cy.get('table').should('exist')
  })

  it('deve listar pedidos pendentes de pagamento', () => {
    cy.get('body').invoke('text').should('match', /Aguardando|pendente|pagamento/)
  })

  it('deve navegar para detalhes do pedido ao clicar no número na tela de financeiro', () => {
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  // Testes destrutivos: cada um reseta o banco para garantir independência
  describe('ações que alteram status do pedido', () => {

    beforeEach(() => {
      cy.resetarBanco()
      cy.loginComo('admin')
      cy.visit('/financeiro')
    })

    it('deve marcar pedido como pago na tela de financeiro', () => {
      cy.get('table tbody tr [data-cy=btn-pago]').first().click()
      cy.get('body').invoke('text').should('match', /sucesso|Pago/)
    })

    it('deve cancelar pedido na tela de financeiro', () => {
      cy.get('[data-cy=btn-cancelar]:not([disabled])').first().click()
      cy.get('body').invoke('text').should('match', /Cancelado|sucesso/)
    })

  })

})
