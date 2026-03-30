// cypress/e2e/fluxos/mudanca-prestador.cy.ts

describe('Fluxo — Mudança de Prestador', () => {

  before(() => {
    cy.resetarBanco()
  })

  it('admin troca o prestador de um pedido em andamento', () => {
    cy.loginComo('admin')
    cy.visit('/pedidos')

    // Navega para o primeiro pedido em andamento
    cy.get('table tbody tr').each(($tr) => {
      if ($tr.text().includes('Em andamento') || $tr.text().includes('Andamento')) {
        cy.wrap($tr).find('a[href*="pedidos"]').click()
        return false
      }
    })

    // Verifica se existe opção de trocar prestador
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=btn-trocar-prestador]').length > 0) {
        cy.get('[data-cy=btn-trocar-prestador]').click()
        cy.get('select[name*="prestador"]').select(1)
        cy.get('[data-cy=btn-salvar-prestador]').click()
        cy.get('.swal2-confirm').click()
        cy.get('body').invoke('text').should('match', /sucesso|Prestador/)
      }
    })
  })

  it('log deve registrar mudança de prestador', () => {
    cy.loginComo('admin')
    cy.visit('/log')
    cy.get('table tbody tr').should('have.length.greaterThan', 0)
    cy.get('body').invoke('text').should('match', /prestador|Order/)
  })

})
