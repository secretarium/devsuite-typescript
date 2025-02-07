const cypress = require('cypress');
const cypressPreset = require('@nx/cypress/plugins/cypress-preset');

const cypressJsonConfig = {
    baseUrl: 'http://127.0.0.1:4210'
};

module.exports = cypress.defineConfig({
    e2e: {
        ...cypressPreset.nxE2EPreset(__dirname),
        ...cypressJsonConfig
    }
});
