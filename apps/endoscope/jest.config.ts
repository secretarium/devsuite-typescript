/* eslint-disable */
import * as path from 'node:path';
import { readFileSync } from 'node:fs';

// Reading the SWC compilation config and remove the "exclude"
// for the test files to be compiled by SWC
const { exclude: _, ...swcJestConfig } = JSON.parse(
    readFileSync(`${__dirname}/.swcrc`, 'utf-8')
) as any;

// disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves.
// If we do not disable this, SWC Core will read .swcrc and won't transform our test files due to "exclude"
if (swcJestConfig.swcrc === undefined) {
    swcJestConfig.swcrc = false;
}

swcJestConfig.jsc.transform.react = { runtime: 'automatic' }

console.log(JSON.stringify(swcJestConfig, null, 2));
// Uncomment if using global setup/teardown files being transformed via swc
// https://nx.dev/packages/jest/documents/overview#global-setup/teardown-with-nx-libraries
// jest needs EsModule Interop to find the default exported setup/teardown functions
// swcJestConfig.module.noInterop = false;

export default {
    displayName: 'endoscope',
    preset: '../../jest.preset.cjs',
    transform: {
        '^.+\\.[tj]sx?$': ['@swc/jest', swcJestConfig],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
    testEnvironment: 'jsdom',
    coverageDirectory: '../../coverage/libs/endoscope',
    setupFiles: [path.resolve(__dirname, 'jest/setupFile.cjs')]
};
