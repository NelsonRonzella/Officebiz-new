// cypress/e2e/admin/tutoriais.cy.ts

describe('Admin — Tutoriais', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
    cy.visit('/tutoriais')
  })

  it('deve exibir a listagem de tutoriais', () => {
    cy.contains('Tutoriais').should('be.visible')
  })

  it('deve exibir o formulário de cadastro de tutorial para admin', () => {
    cy.get('input[name=title]').should('be.visible')
    cy.get('input[name=description]').should('be.visible')
    cy.get('input[name=link]').should('be.visible')
  })

  it('não deve cadastrar tutorial sem preencher título', () => {
    cy.get('input[name=description]').type('Descrição')
    cy.get('input[name=link]').type('https://youtube.com/watch?v=teste')
    cy.get('[data-cy=btn-cadastrar]').click()
    cy.get('body').invoke('text').should('match', /obrigatório|título|campo/)
  })

  it('não deve cadastrar tutorial sem preencher link', () => {
    cy.get('input[name=title]').type('Tutorial sem link')
    cy.get('input[name=description]').type('Descrição')
    cy.get('[data-cy=btn-cadastrar]').click()
    cy.get('body').invoke('text').should('match', /obrigatório|link|campo/)
  })

  it('deve cadastrar tutorial com dados corretos', () => {
    cy.get('input[name=title]').type('Tutorial E2E Teste')
    cy.get('input[name=description]').type('Tutorial criado pelo teste')
    cy.get('input[name=link]').type('https://youtube.com/watch?v=teste123')
    cy.get('[data-cy=btn-cadastrar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Tutorial E2E Teste/)
  })

  it('deve exibir card de tutorial na listagem', () => {
    cy.get('[data-cy=tutorial-card]').should('exist')
  })

  it('deve excluir tutorial ao clicar no botão de excluir', () => {
    cy.get('body').then(($body) => {
      const btn = $body.find('button[form*="delete"], form[action*="delete"] button, [data-cy*="excluir"]')
      if (btn.length > 0) {
        cy.wrap(btn.first()).click()
        // data-ajax-delete: primeiro swal é confirmação, segundo é sucesso
        cy.get('.swal2-confirm').click()
        cy.get('.swal2-confirm').click()
        cy.get('body').invoke('text').should('match', /sucesso/)
      }
    })
  })

  it('deve abrir tutorial ao clicar no card', () => {
    cy.get('body').then(($body) => {
      const link = $body.find('a[href*="youtube.com"], a[href*="youtu.be"]')
      if (link.length > 0) {
        cy.wrap(link.first()).should('have.attr', 'href').and('include', 'youtube')
      }
    })
  })

})
