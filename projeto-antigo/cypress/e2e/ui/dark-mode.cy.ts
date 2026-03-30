// cypress/e2e/ui/dark-mode.cy.ts

describe('UI — Modo Dark', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    // Garante que dark mode começa desativado antes de cada teste
    cy.loginComo('admin')
    cy.visit('/dashboard')
    cy.window().then((win) => {
      win.localStorage.setItem('darkMode', 'false')
      win.document.documentElement.classList.remove('dark')
    })
  })

  it('deve ativar o modo dark ao clicar no botão da lua', () => {
    cy.get('[data-cy=btn-toggle-dark]').click()
    cy.get('html').should('have.class', 'dark')
  })

  it('deve desativar o modo dark ao clicar novamente', () => {
    // Ativa
    cy.get('[data-cy=btn-toggle-dark]').click()
    cy.get('html').should('have.class', 'dark')
    // Desativa
    cy.get('[data-cy=btn-toggle-dark]').click()
    cy.get('html').should('not.have.class', 'dark')
  })

  it('deve persistir o modo dark após navegar para outra página', () => {
    cy.get('[data-cy=btn-toggle-dark]').click()
    cy.get('html').should('have.class', 'dark')
    cy.visit('/pedidos')
    // O script no <head> re-aplica a classe dark baseado no localStorage
    cy.get('html').should('have.class', 'dark')
  })

  it('deve renderizar os elementos corretamente em modo dark', () => {
    cy.get('[data-cy=btn-toggle-dark]').click()
    cy.get('html').should('have.class', 'dark')
    cy.get('nav, aside').should('be.visible')
    cy.get('table, main').should('exist')
  })

})
