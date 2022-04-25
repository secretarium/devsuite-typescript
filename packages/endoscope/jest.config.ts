import path from 'path';

module.exports = {
    displayName: 'endoscope',

    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
        '^.+\\.[tj]sx?$': [
            '@swc/jest',
            { jsc: { transform: { react: { runtime: 'automatic' } } } }
        ]
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/packages/endoscope',
    setupFiles: [path.resolve(__dirname, 'jest/setupFile')],
    preset: '../../jest.preset.ts'
};
