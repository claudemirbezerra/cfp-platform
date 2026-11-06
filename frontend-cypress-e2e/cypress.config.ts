const { nxE2EPreset } = require('@nx/cypress/plugins/cypress-preset');
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      webServerCommands: {
        default: process.env['CI']
          ? 'nx run frontend:serve-static'
          : 'nx run frontend:serve',
        production: 'nx run frontend:serve-static',
      },
      ciWebServerCommand: 'nx run frontend:serve-static',
    }),
    baseUrl: 'http://localhost:4200',
  },
});
