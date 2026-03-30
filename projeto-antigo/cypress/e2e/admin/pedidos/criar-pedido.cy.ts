// cypress/e2e/admin/pedidos/criar-pedido.cy.ts

describe('Admin — Criar Pedido', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
    cy.visit('/pedidos/novo')
  })

  // --- Validações ---

  it('não deve criar pedido sem preencher cliente e produto', () => {
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.url().should('not.include', '/detalhes')
    cy.get('body').invoke('text').should('match', /obrigatório|campo/)
  })

  it('não deve criar pedido sem selecionar cliente', () => {
    cy.get('select[name=product_id]').select(1)
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.url().should('not.include', '/detalhes')
  })

  it('não deve criar pedido sem selecionar produto', () => {
    cy.get('select[name=user_id]').select(1)
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.url().should('not.include', '/detalhes')
  })

  it('não deve listar produtos inativos no select de produto', () => {
    cy.get('select[name=product_id] option').each(($opt) => {
      cy.wrap($opt).invoke('text').should('not.contain', 'Produto Inativo Teste')
    })
  })

  // --- Produto Pontual ---

  it('deve criar pedido pontual apenas com cliente e produto e redirecionar para detalhes', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select('Cliente Exemplo')
    cy.get('select[name=product_id]').select('Produto Pontual Teste')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
    cy.contains('Cliente Exemplo').should('be.visible')
  })

  it('deve criar pedido pontual com cliente, produto e mensagem inicial', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('textarea[name=message]').type('Mensagem inicial do pedido pontual')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido pontual com cliente, produto e 1 anexo', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('input[name="files[]"]').attachFile('arquivo-teste.pdf')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido pontual com cliente, produto e 2 anexos', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('input[name="files[]"]').attachFile(['arquivo-teste.pdf', 'arquivo-teste-2.pdf'])
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido pontual com todos os campos e 1 anexo', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('textarea[name=message]').type('Mensagem com anexo')
    cy.get('input[name="files[]"]').attachFile('arquivo-teste.pdf')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido pontual com todos os campos e 2 anexos', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('textarea[name=message]').type('Mensagem com 2 anexos')
    cy.get('input[name="files[]"]').attachFile(['arquivo-teste.pdf', 'arquivo-teste-2.pdf'])
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  // --- Produto Recorrente ---

  it('deve criar pedido recorrente apenas com cliente e produto', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select('Produto Recorrente Teste')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido recorrente com cliente, produto e 1 anexo', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select('Produto Recorrente Teste')
    cy.get('input[name="files[]"]').attachFile('arquivo-teste.pdf')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve criar pedido recorrente com cliente, produto e 2 anexos', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select('Produto Recorrente Teste')
    cy.get('input[name="files[]"]').attachFile(['arquivo-teste.pdf', 'arquivo-teste-2.pdf'])
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
  })

  it('deve redirecionar para detalhes do pedido e exibir as informações corretas após criar', () => {
    cy.intercept('POST', '/pedidos').as('criarPedido')
    cy.get('select[name=user_id]').select('Cliente Exemplo')
    cy.get('select[name=product_id]').select('Produto Pontual Teste')
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.wait('@criarPedido')
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
    cy.contains('Cliente Exemplo').should('be.visible')
    cy.contains('Aguardando').should('be.visible')
  })

})
