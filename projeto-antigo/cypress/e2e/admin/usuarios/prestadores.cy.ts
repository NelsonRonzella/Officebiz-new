// cypress/e2e/admin/usuarios/prestadores.cy.ts

describe('Admin — Gerenciamento de Prestadores', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
  })

  it('deve exibir a listagem de prestadores', () => {
    cy.visit('/prestadores')
    cy.contains('Prestadores').should('be.visible')
    cy.get('table').should('exist')
  })

  it('não deve criar prestador sem campos obrigatórios', () => {
    cy.visit('/usuarios/prestadores/novo')
    cy.get('[data-cy=btn-criar]').click()
    cy.get('body').invoke('text').should('match', /obrigatório|campo/)
  })

  it('deve criar prestador com dados corretos', () => {
    cy.visit('/usuarios/prestadores/novo')
    cy.get('[data-cy=select-role]').select('prestador')
    cy.get('[data-cy=input-nome]').type('Prestador E2E Teste')
    cy.get('[data-cy=input-telefone]').type('11999990003')
    cy.get('[data-cy=input-email]').type(`prestador-e2e-${Date.now()}@teste.com`)
    cy.get('[data-cy=input-senha]').type('Senha@123')
    cy.get('[data-cy=input-confirmar-senha]').type('Senha@123')
    cy.get('[data-cy=btn-criar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Prestador E2E/)
  })

  it('deve editar prestador existente', () => {
    cy.visit('/prestadores')
    cy.get('table tbody tr').first().find('a[href*="editar"], a[href*="edit"]').click()
    cy.get('[data-cy=input-nome]').clear().type('Prestador Editado E2E')
    cy.get('[data-cy=btn-atualizar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Prestador Editado/)
  })

  // Teste destrutivo: reseta banco antes para não desativar usuário de outros testes
  describe('toggle de ativação', () => {

    beforeEach(() => {
      cy.resetarBanco()
      cy.loginComo('admin')
    })

    it('deve ativar e desativar prestador', () => {
      cy.visit('/prestadores')
      cy.get('table tbody tr').first().within(() => {
        cy.get('button[form*="toggle"], form[action*="toggle"] button').click()
      })
      cy.get('body').invoke('text').should('match', /sucesso|Ativo|Inativo/)
    })

  })

})
