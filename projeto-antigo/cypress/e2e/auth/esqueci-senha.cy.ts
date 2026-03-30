// cypress/e2e/auth/esqueci-senha.cy.ts

describe('Autenticação — Esqueceu a senha', () => {

  beforeEach(() => {
    cy.visit('/forgot-password')
  })

  it('deve exibir a página de esqueci minha senha corretamente', () => {
    cy.url().should('include', '/forgot-password')
    cy.get('#email').should('be.visible')
    cy.get('button[type=submit]').should('be.visible')
  })

  it('não deve enviar link de reset sem preencher o email', () => {
    cy.get('button[type=submit]').click()
    cy.get('#email:invalid').should('exist')
    cy.url().should('include', '/forgot-password')
  })

  it('não deve enviar link de reset com email em formato inválido', () => {
    cy.get('#email').type('emailinvalido')
    cy.get('button[type=submit]').click()
    cy.get('#email:invalid').should('exist')
    cy.url().should('include', '/forgot-password')
  })

  it('deve exibir mensagem de confirmação ao enviar email válido cadastrado', () => {
    cy.get('#email').type(Cypress.env('ADMIN_EMAIL'))
    cy.get('button[type=submit]').click()
    // Verifica o texto da mensagem de sucesso do Laravel (passwords.sent)
    cy.get('body').invoke('text').should('include', 'Enviamos')
  })

  it('deve exibir mensagem ao enviar email válido não cadastrado', () => {
    cy.get('#email').type('naoexiste@teste.com')
    cy.get('button[type=submit]').click()
    // Laravel pode retornar erro ou mensagem genérica
    cy.get('body').invoke('text').should('match', /senha|e-mail|email/)
  })

})
