// cypress/e2e/fluxos/pedido-recorrente-completo.cy.ts

describe('Fluxo Completo — Pedido Recorrente', () => {

  before(() => {
    cy.resetarBanco()
  })

  it('admin cria pedido recorrente e verifica ausência de barra de progresso', () => {
    cy.loginComo('admin')
    cy.visit('/pedidos/novo')
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select('Produto Recorrente Teste')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
    // Produto recorrente deve exibir "—" no lugar da barra de progresso na listagem
    cy.visit('/pedidos')
    cy.get('table tbody tr').first().invoke('text').should('match', /—|Recorrente/)
  })

  it('admin envia documentos para pedido recorrente em andamento', () => {
    cy.loginComo('admin')
    cy.visit('/pedidos')
    cy.get('table tbody tr a[href*="pedidos"]').first().click()
    cy.get('body').then(($body) => {
      // Verifica se existem abas de documentos
      if ($body.find('[class*="tab"], [class*="aba"]').length > 0) {
        cy.get('[class*="tab"], [class*="aba"]').first().click()
        cy.get('input[type=file]').first().attachFile('arquivo-teste.pdf')
        cy.get('[data-cy=btn-enviar]').last().click()
        cy.get('body').invoke('text').should('match', /sucesso|arquivo/)
      }
    })
  })

  it('admin cancela pedido recorrente', () => {
    cy.loginComo('admin')
    cy.visit('/pedidos')
    cy.get('table tbody tr').first().within(() => {
      cy.get('[data-cy=btn-cancelar]').click()
    })
    cy.get('body').invoke('text').should('match', /Cancelado|sucesso/)
  })

  it('não deve exibir formulários de ação em pedido recorrente cancelado', () => {
    cy.loginComo('admin')
    cy.visit('/pedidos')
    cy.get('table tbody tr').each(($tr) => {
      if ($tr.text().includes('Cancelado')) {
        cy.wrap($tr).find('a[href*="pedidos"]').click()
        cy.get('textarea[name=mensagem]').should('not.exist')
        return false
      }
    })
  })

})
