// cypress/e2e/licenciado/pedidos.cy.ts

describe('Licenciado — Pedidos', () => {

  beforeEach(() => {
    cy.loginComo('licenciado')
  })

  it('deve exibir o dashboard do licenciado ao logar', () => {
    cy.visit('/pedidos')
    cy.url().should('include', '/pedidos')
  })

  it('deve exibir a listagem de pedidos do licenciado', () => {
    cy.visit('/pedidos')
    cy.contains('Pedidos').should('be.visible')
    cy.get('table').should('exist')
  })

  it('deve exibir botão de criar pedido para licenciado', () => {
    cy.visit('/pedidos')
    cy.get('[data-cy=link-criar-pedido]').should('be.visible')
  })

  it('não deve criar pedido sem preencher cliente e produto', () => {
    cy.visit('/pedidos/novo')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.url().should('not.include', '/detalhes')
  })

  it('deve criar pedido pontual com cliente e produto', () => {
    cy.visit('/pedidos/novo')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.get('.swal2-confirm').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido pontual com mensagem inicial', () => {
    cy.visit('/pedidos/novo')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('textarea[name=message]').type('Mensagem do licenciado')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.get('.swal2-confirm').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido pontual com 1 anexo', () => {
    cy.visit('/pedidos/novo')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('input[name="files[]"]').attachFile('arquivo-teste.pdf')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.get('.swal2-confirm').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido pontual com 2 anexos', () => {
    cy.visit('/pedidos/novo')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('input[name="files[]"]').attachFile(['arquivo-teste.pdf', 'arquivo-teste-2.pdf'])
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.get('.swal2-confirm').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido pontual com todos os campos e 1 anexo', () => {
    cy.visit('/pedidos/novo')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('textarea[name=message]').type('Pedido completo licenciado')
    cy.get('input[name="files[]"]').attachFile('arquivo-teste.pdf')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.get('.swal2-confirm').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido recorrente com cliente e produto', () => {
    cy.visit('/pedidos/novo')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select('Produto Recorrente Teste')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.get('.swal2-confirm').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('não deve ver pedidos de outros licenciados', () => {
    cy.visit('/pedidos')
    // Licenciado só vê pedidos criados por ele — deve existir pelo menos 1 (do seeder)
    cy.get('table tbody tr').should('have.length.greaterThan', 0)
    cy.get('table tbody tr').each(($tr) => {
      // Nenhuma linha deve mostrar o nome de outro criador
      cy.wrap($tr).invoke('text').should('not.match', /Admin Exemplo/)
    })
  })

})
