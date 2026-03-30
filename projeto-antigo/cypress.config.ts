import { defineConfig } from 'cypress'
import { execSync } from 'child_process'

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:8001',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',

    video: true,
    screenshotOnRunFailure: true,

    viewportWidth: 1280,
    viewportHeight: 720,

    pageLoadTimeout: 120000,        
    defaultCommandTimeout: 10000,
    requestTimeout: 20000,
    responseTimeout: 60000,

    env: {
      ADMIN_EMAIL:       'admin@exemplo.com',
      ADMIN_PASSWORD:    'testeteste',
      LICENCIADO_EMAIL:  'licenciado@exemplo.com',
      CLIENTE_EMAIL:     'cliente@exemplo.com',
      PRESTADOR_EMAIL:   'prestador@exemplo.com',
      INATIVO_EMAIL:     'inativo@exemplo.com',
      SENHA_PADRAO:      'testeteste',
    },

    setupNodeEvents(on) {

      // Flags para estabilidade no Chromium
      on('before:browser:launch', (_browser, launchOptions) => {
        launchOptions.args.push('--disable-dev-shm-usage')
        launchOptions.args.push('--no-sandbox')
        launchOptions.args.push('--disable-gpu')
        launchOptions.args.push('--disable-software-rasterizer')
        return launchOptions
      })

      on('task', {
        resetarBanco() {
          execSync(
            'php artisan db:seed --class=TestSeeder --env=testing',
            { stdio: 'pipe' }
          )
          return null
        },

        verificarServidor({
          url = 'http://127.0.0.1:8001',
          retries = 5,          
          delay = 3000          
        } = {}) {

          const http = require('http')

          const check = (tentativa: number): Promise<boolean> =>
            new Promise((resolve) => {
              http.get(url, () => resolve(true))
                .on('error', () => {
                  if (tentativa < retries) {
                    setTimeout(() => {
                      check(tentativa + 1).then(resolve)
                    }, delay)
                  } else {
                    resolve(false)
                  }
                })
            })

          return check(1)
        },
      })
    },
  },
})