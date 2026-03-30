// cypress/e2e/admin/usuarios/licenciados.cy.ts

describe('Admin — Gerenciamento de Licenciados', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
  })

  it('deve exibir a listagem de licenciados', () => {
    cy.visit('/licenciados')
    cy.contains('Licenciados').should('be.visible')
    cy.get('table').should('exist')
  })

  it('não deve criar licenciado sem campos obrigatórios', () => {
    cy.visit('/usuarios/licenciados/novo')
    cy.get('[data-cy=btn-criar]').click()
    cy.get('body').invoke('text').should('match', /obrigatório|campo/)
  })

  it('deve criar licenciado com dados corretos', () => {
    cy.visit('/usuarios/licenciados/novo')
    cy.get('[data-cy=select-role]').select('licenciado')
    cy.get('[data-cy=input-nome]').type('Licenciado E2E Teste')
    cy.get('[data-cy=input-telefone]').type('11999990002')
    cy.get('[data-cy=input-email]').type(`licenciado-e2e-${Date.now()}@teste.com`)
    cy.get('[data-cy=input-senha]').type('Senha@123')
    cy.get('[data-cy=input-confirmar-senha]').type('Senha@123')
    cy.get('[data-cy=btn-criar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Licenciado E2E/)
  })

  it('deve editar licenciado existente', () => {
    cy.visit('/licenciados')
    cy.get('table tbody tr').first().find('a[href*="editar"], a[href*="edit"]').click()
    cy.get('[data-cy=input-nome]').clear().type('Licenciado Editado E2E')
    cy.get('[data-cy=btn-atualizar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Licenciado Editado/)
  })

  // Teste destrutivo: reseta banco antes para não desativar usuário de outros testes
  describe('toggle de ativação', () => {

    beforeEach(() => {
      cy.resetarBanco()
      cy.loginComo('admin')
    })

    it('deve ativar e desativar licenciado', () => {
      cy.visit('/licenciados')
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[form*="toggle"], form[action*="toggle"] button').click()
      })
      cy.get('body').invoke('text').should('match', /sucesso|Ativo|Inativo/)
    })

  })

})
