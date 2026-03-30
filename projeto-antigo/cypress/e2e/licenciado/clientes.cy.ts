// cypress/e2e/licenciado/clientes.cy.ts

describe('Licenciado — Clientes', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('licenciado')
  })

  it('deve exibir a listagem de clientes', () => {
    cy.visit('/clientes')
    cy.contains('Clientes').should('be.visible')
    cy.get('table').should('exist')
  })

  it('deve exibir botão de criar cliente', () => {
    cy.visit('/clientes')
    cy.get('[data-cy=link-criar]').should('be.visible')
  })

  it('não deve criar cliente sem campos obrigatórios', () => {
    cy.visit('/usuarios/clientes/novo')
    cy.get('[data-cy=btn-criar]').click()
    cy.get('body').invoke('text').should('match', /obrigatório|campo/)
  })

  it('deve criar cliente com dados corretos', () => {
    cy.visit('/usuarios/clientes/novo')
    cy.get('[data-cy=select-role]').select('cliente')
    cy.get('[data-cy=input-nome]').type('Cliente do Licenciado E2E')
    cy.get('[data-cy=input-telefone]').type('11999990001')
    cy.get('[data-cy=input-email]').type(`cli-lic-e2e-${Date.now()}@teste.com`)
    cy.get('[data-cy=input-senha]').type('Senha@123')
    cy.get('[data-cy=input-confirmar-senha]').type('Senha@123')
    cy.get('[data-cy=btn-criar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Cliente do Licenciado/)
  })

})
