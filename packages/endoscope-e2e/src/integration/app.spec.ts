// import { getGreeting } from '../support/app.po';

describe('endoscope', () => {
    beforeEach(() => cy.visit('/'));

    it('should display welcome message', () => {
        // Custom command example, see `../support/commands.ts` file
        cy.inspect();

        // Function helper example, see `../support/app.po.ts` file
        // getGreeting().contains('Inspect Secretarium connection');
    });
});
