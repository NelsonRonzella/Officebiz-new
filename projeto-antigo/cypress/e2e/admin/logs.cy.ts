// cypress/e2e/admin/logs.cy.ts

describe('Admin — Logs de Atividade', () => {

  beforeEach(() => {
    cy.loginComo('admin')
    cy.visit('/log')
  })

  it('deve exibir a página de logs', () => {
    cy.contains('Log').should('be.visible')
    cy.get('table').should('exist')
  })

  it('deve registrar log ao realizar uma ação no sistema', () => {
    cy.visit('/pedidos/novo')
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)

    cy.visit('/log')
    cy.get('table tbody tr').should('have.length.greaterThan', 0)
  })

  it('deve filtrar logs por busca de texto', () => {
    cy.get('input[name=search]').type('pedido')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'search=pedido')
  })

  it('deve filtrar logs por model', () => {
    cy.get('input[name=model]').type('Order')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'model=Order')
  })

  it('deve filtrar logs por ID de usuário', () => {
    cy.get('input[name=user]').type('1')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'user=1')
  })

  it('deve filtrar logs por data', () => {
    cy.get('input[name=date]').type('2026-03-20')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'date')
  })

  it('deve limpar os filtros ao clicar em Limpar', () => {
    cy.get('input[name=search]').type('teste')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.get('[data-cy=link-limpar]').click()
    cy.url().should('not.include', 'search')
  })

  it('deve exibir registros de log na listagem', () => {
    cy.get('table tbody tr').should('have.length.greaterThan', 0)
  })

})
