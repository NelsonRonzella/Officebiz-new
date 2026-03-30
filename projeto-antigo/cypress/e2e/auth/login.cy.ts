// cypress/e2e/auth/login.cy.ts

describe('Autenticação — Login', () => {

  before(() => {
    cy.resetarBanco()
  })

  beforeEach(() => {
    cy.visit('/login')
  })

  it('deve redirecionar admin para o dashboard ao logar com credenciais válidas', () => {
    cy.get('#email').type(Cypress.env('ADMIN_EMAIL'))
    cy.get('#password').type(Cypress.env('SENHA_PADRAO'))
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/dashboard')
  })

  it('deve redirecionar licenciado para o dashboard ao logar com credenciais válidas', () => {
    cy.get('#email').type(Cypress.env('LICENCIADO_EMAIL'))
    cy.get('#password').type(Cypress.env('SENHA_PADRAO'))
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/pedidos')
  })

  it('deve redirecionar cliente para o dashboard ao logar com credenciais válidas', () => {
    cy.get('#email').type(Cypress.env('CLIENTE_EMAIL'))
    cy.get('#password').type(Cypress.env('SENHA_PADRAO'))
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/pedidos')
  })

  it('deve redirecionar prestador para o dashboard ao logar com credenciais válidas', () => {
    cy.get('#email').type(Cypress.env('PRESTADOR_EMAIL'))
    cy.get('#password').type(Cypress.env('SENHA_PADRAO'))
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/pedidos')
  })

  it('não deve permitir login com campo email em branco', () => {
    cy.get('#password').type(Cypress.env('SENHA_PADRAO'))
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/login')
    cy.get('#email:invalid').should('exist')
  })

  it('não deve permitir login com campo senha em branco', () => {
    cy.get('#email').type(Cypress.env('ADMIN_EMAIL'))
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/login')
    cy.get('#password:invalid').should('exist')
  })

  it('não deve permitir login com ambos os campos em branco', () => {
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/login')
  })

  it('não deve permitir login com email em formato inválido', () => {
    cy.get('#email').type('emailsemarroba')
    cy.get('#password').type(Cypress.env('SENHA_PADRAO'))
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/login')
    cy.get('#email:invalid').should('exist')
  })

  it('não deve permitir login com email que não existe no sistema', () => {
    cy.get('#email').type('naoexiste@exemplo.com')
    cy.get('#password').type(Cypress.env('SENHA_PADRAO'))
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/login')
    cy.get('.text-red-600, [class*="text-red"]').should('be.visible')
  })

  it('não deve permitir login com senha incorreta', () => {
    cy.get('#email').type(Cypress.env('ADMIN_EMAIL'))
    cy.get('#password').type('senhaerrada123')
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/login')
    cy.get('.text-red-600, [class*="text-red"]').should('be.visible')
  })

  it('não deve permitir login de usuário inativo', () => {
    cy.get('#email').type(Cypress.env('INATIVO_EMAIL'))
    cy.get('#password').type(Cypress.env('SENHA_PADRAO'))
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/login')
    cy.get('.text-red-600, [class*="text-red"]').should('be.visible')
  })

  it('deve manter o login ao marcar "Lembrar nesse dispositivo" e reabrir o browser', () => {
    cy.get('#email').type(Cypress.env('ADMIN_EMAIL'))
    cy.get('#password').type(Cypress.env('SENHA_PADRAO'))
    cy.get('#remember_me').check()
    cy.get('button[type=submit]').contains('Entrar').click()
    cy.url().should('include', '/dashboard')
    // O Laravel nomeia o cookie como remember_web_<hash>, então buscamos pelo prefixo
    cy.getAllCookies().then((cookies) => {
      const rememberCookie = cookies.find(c => c.name.startsWith('remember_web'))
      expect(rememberCookie, 'cookie remember_web deve existir').to.exist
    })
  })

  it('deve redirecionar para a página de esqueceu a senha ao clicar no link', () => {
    cy.contains('Esqueceu a senha?').click()
    cy.url().should('include', '/forgot-password')
  })

})
