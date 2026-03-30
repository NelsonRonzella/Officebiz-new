// cypress/e2e/auth/logout.cy.ts

describe('Autenticação — Logout', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
    cy.visit('/dashboard')
  })

  it('deve deslogar e redirecionar para a tela de login', () => {
    cy.get('form[action*="logout"] button, button[form*="logout"]')
      .first()
      .click({ force: true })
    cy.url().should('include', '/login')
  })

  it('deve redirecionar para login ao tentar acessar dashboard após logout', () => {
    cy.get('form[action*="logout"] button, button[form*="logout"]')
      .first()
      .click({ force: true })
    cy.visit('/dashboard')
    cy.url().should('include', '/login')
  })

})
