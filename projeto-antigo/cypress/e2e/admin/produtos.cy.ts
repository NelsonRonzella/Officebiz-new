// cypress/e2e/admin/produtos.cy.ts

describe('Admin — Gerenciamento de Produtos', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.loginComo('admin')
  })

  // --- Listagem ---

  it('deve exibir a listagem de produtos', () => {
    cy.visit('/produtos')
    cy.contains('Produtos').should('be.visible')
    cy.get('table, [class*="grid"]').should('exist')
  })

  it('deve filtrar produtos por nome', () => {
    cy.visit('/produtos')
    cy.get('input[name=search], input[placeholder*="buscar"], input[placeholder*="nome"]').first().type('Pontual')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('satisfy', (url: string) => url.includes('search') || url.includes('nome'))
  })

  it('deve filtrar produtos por tipo pontual', () => {
    cy.visit('/produtos')
    cy.get('[data-cy=select-tipo]').select('pontual')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'pontual')
  })

  it('deve filtrar produtos por tipo recorrente', () => {
    cy.visit('/produtos')
    cy.get('[data-cy=select-tipo]').select('recorrente')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'recorrente')
  })

  it('deve filtrar produtos por status ativo', () => {
    cy.visit('/produtos')
    cy.get('[data-cy=select-status]').select('1')
    cy.get('[data-cy=btn-filtrar]').click()
    cy.url().should('include', 'status')
  })

  // --- Cadastro Produto Pontual ---

  it('não deve criar produto pontual sem preencher campos obrigatórios', () => {
    cy.visit('/produtos/pontual/novo')
    cy.get('[data-cy=btn-salvar]').click()
    cy.get('body').invoke('text').should('match', /obrigatório|campo/)
  })

  it('não deve criar produto pontual sem adicionar etapas', () => {
    cy.visit('/produtos/pontual/novo')
    cy.get('input[name=name]').type('Produto Sem Etapa')
    cy.get('input[name=description]').type('Descrição')
    cy.get('input[name=price]').type('100,00')
    cy.get('[data-cy=btn-salvar]').click()
    cy.get('body').invoke('text').should('match', /etapa|obrigatório/)
  })

  it('não deve salvar etapa sem preencher campos ao clicar em Adicionar etapa', () => {
    cy.visit('/produtos/pontual/novo')
    cy.get('[data-cy=btn-adicionar-etapa]').click()
    // Não deve adicionar etapa com campos vazios
    cy.get('[data-cy=btn-adicionar-etapa]').click()
    cy.contains('Obrigatório').should('be.visible')
  })

  it('deve criar produto pontual com dados corretos e 1 etapa', () => {
    cy.visit('/produtos/pontual/novo')
    cy.get('input[name=name]').type('Produto Pontual E2E')
    cy.get('input[name=description]').type('Produto criado pelo teste E2E')
    cy.get('input[name=price]').type('150,00')

    cy.get('[data-cy=btn-adicionar-etapa]').click()
    cy.get('[data-cy=step-titulo]').last().type('Etapa 1')
    cy.get('[data-cy=step-descricao]').last().type('Descrição da etapa 1')
    cy.get('[data-cy=step-tempo]').last().type('5')
    cy.get('[data-cy=step-ordem]').last().type('1')

    cy.get('[data-cy=btn-salvar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Produto Pontual E2E/)
  })

  it('deve criar produto pontual com múltiplas etapas', () => {
    cy.visit('/produtos/pontual/novo')
    cy.get('input[name=name]').type('Produto Pontual Multi-Etapa E2E')
    cy.get('input[name=description]').type('Produto com 2 etapas')
    cy.get('input[name=price]').type('200,00')

    // Etapa 1
    cy.get('[data-cy=btn-adicionar-etapa]').click()
    cy.get('[data-cy=step-titulo]').last().type('Etapa 1')
    cy.get('[data-cy=step-descricao]').last().type('Primeira etapa')
    cy.get('[data-cy=step-tempo]').last().type('3')
    cy.get('[data-cy=step-ordem]').last().type('1')

    // Etapa 2
    cy.get('[data-cy=btn-adicionar-etapa]').click()
    cy.get('[data-cy=step-titulo]').last().type('Etapa 2')
    cy.get('[data-cy=step-descricao]').last().type('Segunda etapa')
    cy.get('[data-cy=step-tempo]').last().type('7')
    cy.get('[data-cy=step-ordem]').last().type('2')

    cy.get('[data-cy=btn-salvar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Produto Pontual Multi/)
  })

  // --- Cadastro Produto Recorrente ---

  it('não deve criar produto recorrente sem adicionar abas', () => {
    cy.visit('/produtos/recorrente/novo')
    cy.get('input[name=name]').type('Produto Sem Aba')
    cy.get('input[name=description]').type('Sem abas')
    cy.get('input[name=price]').type('100,00')
    cy.get('[data-cy=btn-salvar]').click()
    cy.get('body').invoke('text').should('match', /aba|obrigatório/)
  })

  it('não deve salvar aba sem preencher campos ao clicar em Adicionar aba', () => {
    cy.visit('/produtos/recorrente/novo')
    cy.get('[data-cy=btn-adicionar-aba]').click()
    cy.get('[data-cy=btn-adicionar-aba]').click()
    cy.contains('Obrigatório').should('be.visible')
  })

  it('deve criar produto recorrente com dados corretos e 1 aba', () => {
    cy.visit('/produtos/recorrente/novo')
    cy.get('input[name=name]').type('Produto Recorrente E2E')
    cy.get('input[name=description]').type('Produto recorrente criado pelo teste E2E')
    cy.get('input[name=price]').type('299,00')

    cy.get('[data-cy=btn-adicionar-aba]').click()
    cy.get('[data-cy=tab-titulo]').last().type('Aba 1')
    cy.get('[data-cy=tab-descricao]').last().type('Descrição da aba 1')
    cy.get('[data-cy=tab-ordem]').last().type('1')

    cy.get('[data-cy=btn-salvar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Produto Recorrente E2E/)
  })

  // --- Edição ---

  it('deve editar produto existente', () => {
    cy.visit('/produtos')
    cy.get('a[href*="editar"], a[href*="edit"]').first().click()
    cy.get('input[name=name]').clear().type('Produto Editado E2E')
    cy.get('[data-cy=btn-salvar]').click()
    cy.get('body').invoke('text').should('match', /sucesso|Produto Editado/)
  })

  // --- Ativação/Desativação ---

  it('deve ativar e desativar produto', () => {
    cy.visit('/produtos')
    cy.get('button[form*="toggle"], form[action*="toggle"] button').first().click()
    cy.get('body').invoke('text').should('match', /sucesso|Ativo|Inativo/)
  })

})
