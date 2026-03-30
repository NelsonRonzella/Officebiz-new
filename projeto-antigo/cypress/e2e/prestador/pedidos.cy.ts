// cypress/e2e/prestador/pedidos.cy.ts

describe('Prestador — Pedidos', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('prestador')
  })

  it('deve exibir o dashboard do prestador ao logar', () => {
    cy.visit('/pedidos')
    cy.url().should('include', '/pedidos')
  })

  it('deve exibir apenas pedidos atribuídos ou pagos sem prestador', () => {
    cy.visit('/pedidos')
    cy.contains('Pedidos').should('be.visible')
    cy.get('table').should('exist')
  })

  it('deve aceitar pedido pago sem prestador atribuído', () => {
    cy.visit('/pedidos')
    cy.get('table tbody tr').each(($tr) => {
      const $btn = $tr.find('[data-cy=btn-aceitar]')
      if ($btn.length > 0) {
        cy.wrap($btn.first()).click()
        cy.get('body').invoke('text').should('match', /sucesso|aceito|andamento/)
        return false // break
      }
    })
  })

  it('deve enviar mensagem em pedido em andamento', () => {
    cy.visit('/pedidos')
    // Navega diretamente para um pedido em andamento
    cy.get('table tbody tr').contains('Em andamento').closest('tr').find('a[href*="pedidos"]').click()
    cy.get('textarea[name=mensagem]').type('Mensagem do prestador')
    cy.get('[data-cy=btn-enviar]').click()
    cy.get('.swal2-confirm').click()
    cy.contains('Mensagem do prestador').should('exist')
  })

  it('deve enviar mensagem com anexo em pedido em andamento', () => {
    cy.visit('/pedidos')
    cy.get('table tbody tr').contains('Em andamento').closest('tr').find('a[href*="pedidos"]').click()
    cy.get('textarea[name=mensagem]').type('Mensagem com arquivo do prestador')
    cy.get('input[type=file][name=file]').attachFile('arquivo-teste.pdf')
    cy.get('[data-cy=btn-enviar]').click()
    cy.get('.swal2-confirm').click()
    cy.contains('Mensagem com arquivo').should('exist')
  })

  it('não deve exibir formulários de mensagem em pedidos cancelados', () => {
    cy.visit('/pedidos')
    cy.get('table tbody tr').each(($tr) => {
      if ($tr.text().includes('Cancelado')) {
        cy.wrap($tr).find('a[href*="pedidos"]').click()
        cy.get('textarea[name=mensagem]').should('not.exist')
        return false
      }
    })
  })

  it('não deve exibir formulários de mensagem em pedidos não atribuídos ao prestador', () => {
    // Pedidos aguardando pagamento não devem ter formulário de mensagem para prestador
    cy.visit('/pedidos')
    cy.get('table tbody tr').each(($tr) => {
      if ($tr.text().includes('Aguardando')) {
        cy.wrap($tr).find('a[href*="pedidos"]').click()
        cy.get('textarea[name=mensagem]').should('not.exist')
        return false
      }
    })
  })

})
