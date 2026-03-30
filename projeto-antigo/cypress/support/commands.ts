// cypress/support/commands.ts
import 'cypress-file-upload'

type Role = 'admin' | 'licenciado' | 'cliente' | 'prestador'

/**
 * Re-executa o TestSeeder para restaurar o estado inicial do banco de testes.
 * Deve ser chamado em before()/beforeEach() quando testes alteram dados.
 */
Cypress.Commands.add('resetarBanco', () => {
  cy.task('resetarBanco')
})

/**
 * Realiza login com as credenciais do role informado.
 * Reutiliza sessão via cy.session para evitar login repetido entre testes.
 */
Cypress.Commands.add('loginComo', (role: Role) => {
  const credenciais: Record<Role, { email: string; senha: string }> = {
    admin:      { email: Cypress.env('ADMIN_EMAIL'),      senha: Cypress.env('SENHA_PADRAO') },
    licenciado: { email: Cypress.env('LICENCIADO_EMAIL'), senha: Cypress.env('SENHA_PADRAO') },
    cliente:    { email: Cypress.env('CLIENTE_EMAIL'),    senha: Cypress.env('SENHA_PADRAO') },
    prestador:  { email: Cypress.env('PRESTADOR_EMAIL'),  senha: Cypress.env('SENHA_PADRAO') },
  }

  cy.session(role, () => {
    cy.visit('/login')
    cy.get('#email').type(credenciais[role].email)
    cy.get('#password').type(credenciais[role].senha)
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('not.include', '/login')
  }, {
    validate() {
      // Se a sessão server-side foi invalidada (ex: logout), rejeita o cache e refaz o login
      cy.request({ url: '/pedidos', followRedirect: false, failOnStatusCode: false })
        .its('status')
        .should('not.eq', 302)
    },
  })
})

/**
 * Digita em um input do formulário de produto/etapa pelo atributo data-cy.
 * Limpa o campo antes de digitar.
 */
Cypress.Commands.add('preencherCampo', (dataCy: string, valor: string) => {
  cy.get(`[data-cy="${dataCy}"]`).clear().type(valor)
})

declare global {
  namespace Cypress {
    interface Chainable {
      loginComo(role: Role): Chainable<void>
      preencherCampo(dataCy: string, valor: string): Chainable<void>
      resetarBanco(): Chainable<void>
    }
  }
}
