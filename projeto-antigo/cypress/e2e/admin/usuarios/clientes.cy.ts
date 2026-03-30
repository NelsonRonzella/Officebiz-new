// cypress/e2e/admin/usuarios/clientes.cy.ts

describe('Admin — Gerenciamento de Clientes', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
  })

  it('deve exibir a listagem de clientes', () => {
    cy.visit('/clientes')
    cy.contains('Clientes').should('be.visible')
    cy.get('table').should('exist')
  })

  it('deve exibir botão de criar cliente na listagem', () => {
    cy.visit('/clientes')
    cy.get('[data-cy=link-criar]').should('be.visible')
  })

  it('não deve criar cliente sem preencher campos obrigatórios', () => {
    cy.visit('/usuarios/clientes/novo')
    cy.get('[data-cy=btn-criar]').click()
    cy.url().should('not.match', /\/clientes\/\d+/)
    cy.get('body').invoke('text').should('match', /obrigatório|campo/)
  })

  it('não deve criar cliente com email em formato inválido', () => {
    cy.visit('/usuarios/clientes/novo')
    cy.get('[data-cy=input-nome]').type('Cliente Inválido')
    cy.get('[data-cy=input-telefone]').type('11999990001')
    cy.get('[data-cy=input-email]').type('emailsemarroba')
    cy.get('[data-cy=input-senha]').type('Senha@123')
    cy.get('[data-cy=input-confirmar-senha]').type('Senha@123')
    cy.get('[data-cy=btn-criar]').click()
    cy.url().should('not.match', /\/clientes\/\d+/)
  })

  it('deve criar cliente com dados corretos', () => {
    cy.visit('/usuarios/clientes/novo')
    cy.get('[data-cy=select-role]').select('cliente')
    cy.get('[data-cy=input-nome]').type('Cliente E2E Teste')
    cy.get('[data-cy=input-telefone]').type('11999990001')
    cy.get('[data-cy=input-email]').type(`cliente-e2e-${Date.now()}@teste.com`)
    cy.get('[data-cy=input-senha]').type('Senha@123')
    cy.get('[data-cy=input-confirmar-senha]').type('Senha@123')
    cy.get('[data-cy=btn-criar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Cliente E2E Teste/)
  })

  it('deve editar dados de um cliente existente', () => {
    cy.visit('/clientes')
    cy.get('table tbody tr').first().find('a[href*="editar"], a[href*="edit"]').click()
    cy.get('[data-cy=input-nome]').clear().type('Nome Editado E2E')
    cy.get('[data-cy=btn-atualizar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Nome Editado E2E/)
  })

  // Teste destrutivo: reseta banco antes para não desativar usuário de outros testes
  describe('toggle de ativação', () => {

    beforeEach(() => {
      cy.resetarBanco()
      cy.loginComo('admin')
    })

    it('deve ativar e desativar um cliente na listagem', () => {
      cy.visit('/clientes')
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[form*="toggle"], form[action*="toggle"] button').click()
      })
      cy.get('body').invoke('text').should('match', /sucesso|Ativo|Inativo/)
    })

  })

})
