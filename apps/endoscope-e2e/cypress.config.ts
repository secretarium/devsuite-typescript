import { defineConfig } from 'cypress';
import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';

const cypressJsonConfig = {
    baseUrl: 'http://127.0.0.1:4210'
};

export default defineConfig({
    e2e: {
        ...nxE2EPreset(__dirname),
        ...cypressJsonConfig
    }
});
