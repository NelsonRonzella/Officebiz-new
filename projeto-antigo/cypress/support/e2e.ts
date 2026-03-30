// cypress/support/e2e.ts
import './commands'

// Ignora erros do console que não são de responsabilidade dos testes
Cypress.on('uncaught:exception', (err) => {
  // Alpine.js pode lançar erros ao reinicializar entre navegações — ignorar
  if (err.message.includes('Alpine') || err.message.includes('Cannot read properties')) {
    return false
  }
})

// Intercepta rotas do dashboard que usam MONTH()/DAY() — funções MySQL incompatíveis
// com SQLite. Sem isso, essas chamadas retornam 500 e podem travar o servidor
// PHP built-in (single-threaded) no CI, derrubando todos os specs seguintes.
beforeEach(() => {
  cy.intercept('GET', '/api/dashboard/faturamento', {
    statusCode: 200,
    body: [],
  }).as('faturamentoMensal')

  cy.intercept('GET', '/api/dashboard/pedidos-dia', {
    statusCode: 200,
    body: [],
  }).as('pedidosPorDia')
})
