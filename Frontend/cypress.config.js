import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: false,
    video: false,
    viewportWidth: 1440,
    viewportHeight: 1100,
    setupNodeEvents(on, config) {
      return config;
    },
  },
});