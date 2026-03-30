// cypress/e2e/admin/pedidos/transicoes-retorno.cy.ts

describe('Admin — Transições de Status: Retorno', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.resetarBanco()
    cy.loginComo('admin')
  })

  it('deve conseguir marcar pedido como RETORNO a partir de EM_ANDAMENTO', () => {
    cy.visit('/pedidos?status=1')
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
    cy.url().should('match', /\/pedidos\/\d+/)
    cy.get('select[name=status]').select('3') // RETORNO = 3
    cy.get('[data-cy=btn-salvar-status]').click()
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.get('body').invoke('text').should('match', /Retorno|retorno/)
  })

  it('deve conseguir CONCLUIR pedido que está em RETORNO', () => {
    // Primeiro marca como retorno
    cy.visit('/pedidos?status=1')
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
    cy.get('select[name=status]').select('3')
    cy.get('[data-cy=btn-salvar-status]').click()
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()

    // Agora conclui
    cy.get('[data-cy=btn-concluir], [data-cy=btn-salvar-status]').then(($el) => {
      if ($el.is('[data-cy=btn-concluir]')) {
        cy.wrap($el).click()
        cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
      } else {
        cy.get('select[name=status]').select('5') // CONCLUIDO = 5
        cy.get('[data-cy=btn-salvar-status]').click()
        cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
      }
    })

    cy.get('body').invoke('text').should('match', /Conclu[ií]do/)
  })

  it('deve conseguir CANCELAR pedido que está em RETORNO', () => {
    // Primeiro marca como retorno
    cy.visit('/pedidos?status=1')
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
    cy.get('select[name=status]').select('3')
    cy.get('[data-cy=btn-salvar-status]').click()
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()

    // Agora cancela via select de status
    cy.get('select[name=status]').select('2') // CANCELADO = 2
    cy.get('[data-cy=btn-salvar-status]').click()
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()

    cy.get('body').invoke('text').should('match', /Cancelado|cancelado/)
  })

  it('pedido CONCLUIDO não exibe botão de cancelar na listagem', () => {
    // Primeiro conclui um pedido via detalhes
    cy.visit('/pedidos?status=1')
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
    cy.get('select[name=status]').select('5') // CONCLUIDO
    cy.get('[data-cy=btn-salvar-status]').click()
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()

    // Vai à listagem de concluídos e verifica que o botão cancelar está desabilitado
    cy.visit('/pedidos?status=5')
    cy.get('table tbody tr').first().within(() => {
      cy.get('[data-cy=btn-cancelar]').should('be.disabled')
    })
  })

})
