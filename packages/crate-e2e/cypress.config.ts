import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nrwl/cypress/plugins/cypress-preset';

const cypressJsonConfig = {
    baseUrl: 'http://localhost:4200'
};

export default defineConfig({
    e2e: {
        ...nxE2EPreset(__dirname),
        ...cypressJsonConfig
    }
});
