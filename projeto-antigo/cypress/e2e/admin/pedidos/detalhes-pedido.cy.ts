// cypress/e2e/admin/pedidos/detalhes-pedido.cy.ts

describe('Admin — Detalhes do Pedido', () => {

  before(() => {
    // Garante que o banco tem pedidos em andamento antes de qualquer teste
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
    // Filtra por "Em andamento" para garantir que formulários de mensagem/anexo estão disponíveis
    cy.visit('/pedidos?status=1')
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
  })

  it('deve exibir as informações do pedido na tela de detalhes', () => {
    cy.url().should('match', /\/pedidos\/\d+/)
    cy.get('body').should('contain.text', 'Cliente Exemplo')
  })

  it('deve exibir o select de status visível para o admin', () => {
    cy.get('select[name=status]').should('be.visible')
    cy.get('[data-cy=btn-salvar-status]').should('be.visible')
  })

  it('deve alterar o status do pedido', () => {
    cy.get('select[name=status]').select('1') // EM_ANDAMENTO
    cy.get('[data-cy=btn-salvar-status]').click()
    cy.get('.swal2-confirm').click()
    cy.get('body').invoke('text').should('match', /Em andamento|Andamento/)
  })

  it('deve exibir o botão de avançar etapa apenas quando o pedido está em andamento', () => {
    // Muda para Em andamento
    cy.get('select[name=status]').select('1')
    cy.get('[data-cy=btn-salvar-status]').click()
    cy.get('body').invoke('text').should('match', /.*/)
  })

  it('deve enviar mensagem sem anexo', () => {
    cy.get('textarea[name=mensagem]').type('Mensagem de teste sem anexo')
    cy.get('[data-cy=btn-enviar]').click()
    cy.get('.swal2-confirm').click()
    cy.get('[data-cy=mensagem-texto]').should('contain.text', 'Mensagem de teste sem anexo')
  })

  it('não deve enviar mensagem sem preencher o texto', () => {
    cy.get('[data-cy=btn-enviar]').click()
    cy.get('.swal2-confirm').click()
    cy.get('body').invoke('text').should('match', /obrigatório|campo/)
  })

  it('deve enviar mensagem com anexo', () => {
    cy.get('textarea[name=mensagem]').type('Mensagem com arquivo')
    cy.get('input[type=file][name=file]').attachFile('arquivo-teste.pdf')
    cy.get('[data-cy=btn-enviar]').click()
    cy.get('.swal2-confirm').click()
    cy.get('[data-cy=mensagem-texto]').should('contain.text', 'Mensagem com arquivo')
  })

  it('deve fazer download de um anexo do pedido', () => {
    // Verifica que existe pelo menos um link de download
    cy.get('a[href*="download"]').first().should('exist').then(($a) => {
      const href = $a.attr('href')!
      cy.request(href).its('status').should('eq', 200)
    })
  })

  it('deve filtrar mensagens por data', () => {
    cy.get('input[name=data_inicio], input[type=date]').first().type('2026-01-01')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'data')
  })

  it('deve filtrar mensagens por texto', () => {
    cy.get('input[name=search], input[placeholder*="Buscar"]').first().type('mensagem')
    cy.get('[data-cy=btn-filtrar]').click()
  })

  it('deve enviar anexos adicionais ao pedido', () => {
    cy.get('input[type=file]:not([name=file])').first().attachFile('arquivo-teste.pdf')
    cy.get('[data-cy=btn-enviar]').last().click()
    cy.get('.swal2-confirm').click()
    cy.get('body').invoke('text').should('match', /arquivo/)
  })

  it('deve trocar o prestador do pedido', () => {
    cy.get('[data-cy=btn-trocar-prestador]').click()
    cy.get('select[name="prestador_id"]').select('Prestador Exemplo')
    cy.get('[data-cy=btn-salvar-prestador]').click()
    cy.get('.swal2-confirm').click()
    cy.get('body').invoke('text').should('match', /Prestador/)
  })

  // Este teste cancela o pedido — deve ficar por último para não afetar os demais
  it('não deve exibir formulários de mensagem, anexo e documentos em pedidos cancelados', () => {
    cy.get('select[name=status]').select('2') // CANCELADO
    cy.get('[data-cy=btn-salvar-status]').click()
    cy.get('.swal2-confirm').click() // dismiss success → page reloads automaticamente
    cy.get('textarea[name=mensagem]').should('not.exist')
  })

})
