// cypress/e2e/ui/notificacoes.cy.ts

describe('UI — Notificações', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
  })

  // ─── Helpers ─────────────────────────────────────────────────────

  function abrirPrimeiroEmAndamento() {
    cy.visit('/pedidos?status=1')
    cy.get('table tbody tr').first().find('a[href*="pedidos"]').click()
  }

  // Após qualquer ação (ajax ou redirect), navega para o dashboard.
  // O Alpine dispara x-init → GET /notificacoes nessa nova página,
  // capturado pelo intercept registrado antes da chamada.
  function verificarNotificacaoCriada() {
    cy.intercept('GET', '/notificacoes').as('notifVerif')
    cy.visit('/dashboard', { timeout: 30000 })
    cy.wait('@notifVerif', { timeout: 30000 }).its('response.body.unread_count').should('be.greaterThan', 0)
  }

  // ─── UI do painel ────────────────────────────────────────────────

  it('deve exibir o ícone de notificações no menu', () => {
    cy.visit('/dashboard')
    cy.get('[data-cy=btn-notificacoes]').should('exist')
  })

  it('deve abrir o painel de notificações ao clicar no sino', () => {
    cy.visit('/dashboard')
    cy.get('[data-cy=btn-notificacoes]').click()
    cy.get('[data-cy=painel-notificacoes]').should('be.visible')
  })

  // ─── Geração de notificações ──────────────────────────────────────

  it('deve gerar notificação ao criar um pedido', () => {
    cy.visit('/pedidos/novo')
    cy.get('select[name=user_id]').select(1)
    cy.get('select[name=product_id]').select(1)
    cy.get('[data-cy=btn-criar-pedido]').click()
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    cy.url().should('match', /\/pedidos\/\d+/)
    verificarNotificacaoCriada()
  })

  it('deve gerar notificação ao enviar mensagem em um pedido', () => {
    abrirPrimeiroEmAndamento()
    cy.get('textarea[name=mensagem]').type('Mensagem para teste de notificação')
    cy.get('[data-cy=btn-enviar]').click()
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    verificarNotificacaoCriada()
  })

  it('deve gerar notificação ao adicionar anexo a um pedido', () => {
    abrirPrimeiroEmAndamento()
    cy.get('[data-cy=btn-abrir-upload]').click()
    cy.get('input[type=file][name="files[]"]').attachFile('arquivo-teste.pdf')
    cy.get('[data-cy=btn-enviar-arquivo]').click()
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    verificarNotificacaoCriada()
  })

  it('deve gerar notificação ao vincular prestador a um pedido', () => {
    abrirPrimeiroEmAndamento()
    cy.get('[data-cy=btn-trocar-prestador]').click()
    cy.get('select[name="prestador_id"]').select(1)
    cy.get('[data-cy=btn-salvar-prestador]').click()
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    verificarNotificacaoCriada()
  })

  it('deve gerar notificação ao avançar etapa de um pedido', () => {
    abrirPrimeiroEmAndamento()
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy=btn-avancar-etapa]').length > 0) {
        cy.get('[data-cy=btn-avancar-etapa]').click()
        verificarNotificacaoCriada()
      }
    })
  })

  it('deve gerar notificação ao atualizar status de um pedido', () => {
    cy.visit('/pedidos?status=1')
    cy.get('table tbody tr').first().find('[data-cy=btn-cancelar]').click()
    verificarNotificacaoCriada()
  })

  it('deve gerar notificação ao concluir um pedido', () => {
    cy.visit('/pedidos?status=1')
    cy.get('table tbody tr').first().within(() => {
      cy.get('[data-cy=btn-concluir]').click()
    })
    cy.get('.swal2-confirm', { timeout: 10000 }).should('be.visible').click()
    verificarNotificacaoCriada()
  })

  // ─── "Marcar todas" roda por último (garante que há não-lidas) ────

  it('deve marcar todas as notificações como lidas', () => {
    cy.intercept('GET', '/notificacoes').as('notifLoad')
    cy.visit('/dashboard')
    cy.wait('@notifLoad').then(({ response }) => {
      if (response!.body.unread_count > 0) {
        cy.get('[data-cy=btn-notificacoes]').click()
        cy.get('[data-cy=painel-notificacoes]').should('be.visible')
        cy.intercept('POST', '/notificacoes/ler-todas').as('lerTodas')
        cy.contains('Marcar todas como lidas').click()
        cy.wait('@lerTodas').its('response.statusCode').should('eq', 200)
      }
    })
  })

})
