import * as path from 'node:path';

export default {
    displayName: 'endoscope',
    preset: '../../jest.preset.cjs',
    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
        '^.+\\.[tj]sx?$': [
            '@swc/jest',
            { jsc: { transform: { react: { runtime: 'automatic' } } } }
        ]
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/apps/endoscope',
    setupFiles: [path.resolve(__dirname, 'jest/setupFile.cjs')]
};
