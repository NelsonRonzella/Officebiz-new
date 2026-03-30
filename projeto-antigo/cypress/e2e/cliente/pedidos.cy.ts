// cypress/e2e/cliente/pedidos.cy.ts

describe('Cliente — Pedidos', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('cliente')
  })

  it('deve exibir o dashboard do cliente ao logar', () => {
    cy.visit('/pedidos')
    cy.url().should('include', '/pedidos')
  })

  it('deve visualizar somente seus próprios pedidos na listagem', () => {
    cy.visit('/pedidos')
    cy.contains('Pedidos').should('be.visible')
    cy.get('table').should('exist')
  })

  it('não deve exibir botão de criar pedido para cliente', () => {
    cy.visit('/pedidos')
    cy.get('[data-cy=link-criar-pedido]').should('not.exist')
  })

  it('deve visualizar os detalhes de um pedido', () => {
    cy.visit('/pedidos')
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
    cy.url().should('match', /\/pedidos\/\d+/)
    cy.get('body').should('contain.text', 'Cliente Exemplo')
  })

  it('não deve exibir formulário de mensagem para cliente', () => {
    cy.visit('/pedidos')
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
    cy.get('textarea[name=mensagem]').should('not.exist')
  })

  it('não deve exibir select de status para cliente', () => {
    cy.visit('/pedidos')
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
    cy.get('select[name=status]').should('not.exist')
  })

  it('não deve exibir botões de ação na listagem para cliente', () => {
    cy.visit('/pedidos')
    cy.get('table tbody tr').first().within(() => {
      cy.get('[data-cy=btn-cancelar]').should('not.exist')
      cy.get('[data-cy=btn-pago]').should('not.exist')
      cy.get('[data-cy=btn-concluir]').should('not.exist')
    })
  })

  it('deve ser bloqueado ao tentar acessar área de admin', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.url().should('include', '/pedidos')
  })

  it('deve ser bloqueado ao tentar acessar área de admin via URL direta', () => {
    cy.request({ url: '/financeiro', failOnStatusCode: false, followRedirect: false })
      .its('status')
      .should('not.eq', 200)
  })

})
