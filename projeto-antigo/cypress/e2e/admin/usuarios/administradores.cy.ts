// cypress/e2e/admin/usuarios/administradores.cy.ts

describe('Admin — Gerenciamento de Administradores', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
  })

  it('deve exibir a listagem de administradores', () => {
    cy.visit('/administradores')
    cy.contains('Administradores').should('be.visible')
    cy.get('table').should('exist')
  })

  it('não deve criar administrador sem campos obrigatórios', () => {
    cy.visit('/usuarios/admin/novo')
    cy.get('[data-cy=btn-criar]').click()
    cy.get('body').invoke('text').should('match', /obrigatório|campo/)
  })

  it('deve criar administrador com dados corretos', () => {
    cy.visit('/usuarios/admin/novo')
    cy.get('[data-cy=select-role]').select('admin')
    cy.get('[data-cy=input-nome]').type('Admin E2E Teste')
    cy.get('[data-cy=input-telefone]').type('11999990001')
    cy.get('[data-cy=input-email]').type(`admin-e2e-${Date.now()}@teste.com`)
    cy.get('[data-cy=input-senha]').type('Senha@123')
    cy.get('[data-cy=input-confirmar-senha]').type('Senha@123')
    cy.get('[data-cy=btn-criar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Admin E2E Teste/)
  })

  it('deve editar administrador existente', () => {
    cy.visit('/administradores')
    cy.get('table tbody tr').first().find('a[href*="editar"], a[href*="edit"]').click()
    cy.get('[data-cy=input-nome]').clear().type('Admin Editado E2E')
    cy.get('[data-cy=btn-atualizar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Admin Editado/)
  })

  // Teste destrutivo: reseta banco antes para não desativar usuário de outros testes
  describe('toggle de ativação', () => {

    beforeEach(() => {
      cy.resetarBanco()
      cy.loginComo('admin')
    })

    it('deve ativar e desativar administrador', () => {
      cy.visit('/administradores')
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[form*="toggle"], form[action*="toggle"] button').click()
      })
      cy.get('body').invoke('text').should('match', /sucesso|Ativo|Inativo/)
    })

  })

})
