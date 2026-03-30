// cypress/e2e/licenciado/tutoriais.cy.ts

describe('Licenciado — Tutoriais (somente leitura)', () => {

  beforeEach(() => {
    cy.loginComo('licenciado')
    cy.visit('/tutoriais')
  })

  it('deve visualizar a listagem de tutoriais', () => {
    cy.contains('Tutoriais').should('be.visible')
  })

  it('não deve exibir o formulário de cadastro de tutoriais para licenciado', () => {
    cy.get('input[name=title]').should('not.exist')
    cy.get('[data-cy=btn-cadastrar]').should('not.exist')
  })

  it('não deve exibir botão de excluir tutorial para licenciado', () => {
    cy.get('button[form*="delete"], [data-cy*="excluir"]').should('not.exist')
  })

  it('deve visualizar detalhes de um produto', () => {
    cy.visit('/produtos')
    cy.get('a[href*="visualizar"]').first().click()
    cy.url().should('include', 'visualizar')
    cy.get('body').should('contain.text', 'Produto')
  })

})
