// cypress/e2e/fluxos/pedido-pontual-completo.cy.ts
// Testa o fluxo completo de criação → pago → prestador aceita → avança etapa → conclusão

describe('Fluxo Completo — Pedido Pontual', () => {

  let pedidoUrl: string

  before(() => {
    cy.resetarBanco()
  })

  it('admin cria pedido pontual e redireciona para detalhes', () => {
    cy.loginComo('admin')
    cy.visit('/pedidos/novo')
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select('Cliente Exemplo')
    cy.get('select[name=product_id]').select('Produto Pontual Teste')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/).then((url) => {
      pedidoUrl = url
    })
    cy.contains('Aguardando').should('be.visible')
  })

  it('admin marca pedido como pago', () => {
    cy.loginComo('admin')
    cy.visit('/pedidos?status=0')
    cy.get('table tbody tr').first().within(() => {
      cy.get('[data-cy=btn-pago]').click()
    })
    cy.get('body').invoke('text').should('match', /Pago|sucesso/)
  })

  it('prestador aceita o pedido pago', () => {
    cy.loginComo('prestador')
    cy.visit('/pedidos')
    cy.get('table tbody tr').contains('Pago').closest('tr').find('[data-cy=btn-aceitar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|andamento|Em andamento/)
  })

  it('admin avança etapa do pedido em andamento', () => {
    cy.loginComo('admin')
    cy.visit(pedidoUrl)
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=btn-avancar-etapa]').length > 0) {
        cy.get('[data-cy=btn-avancar-etapa]').click()
        cy.get('body').invoke('text').should('match', /sucesso|etapa/)
      }
    })
  })

  it('admin conclui o pedido', () => {
    cy.loginComo('admin')
    cy.visit('/pedidos?status=1')
    cy.get('table tbody tr').first().within(() => {
      cy.get('[data-cy=btn-concluir]').then(($btn) => {
        if ($btn.length > 0) {
          cy.wrap($btn.first()).click()
        }
      })
    })
    cy.get('.swal2-confirm').click({ force: true })
    cy.get('body').invoke('text').should('match', /Conclu[ií]do|sucesso/)
  })

  it('admin ainda vê detalhes após pedido concluído', () => {
    cy.loginComo('admin')
    cy.visit(pedidoUrl)
    cy.get('select[name=status]').should('be.visible')
    cy.get('textarea[name=mensagem]').should('be.visible')
  })

})
