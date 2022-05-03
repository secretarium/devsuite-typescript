// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
    displayName: 'endoscope',
    preset: '../../jest.preset.ts',
    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
        '^.+\\.[tj]sx?$': [
            '@swc/jest',
            { jsc: { transform: { react: { runtime: 'automatic' } } } }
        ]
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/packages/endoscope',
    setupFiles: [path.resolve(__dirname, 'jest/setupFile')]
};
