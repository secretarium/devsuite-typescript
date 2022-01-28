module.exports = {
    displayName: 'crate',
    preset: '../../jest.preset.js',
    transform: {
        '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nrwl/react/plugins/jest',
        '^.+\\.[tj]sx?$': ['@swc/jest', { jsc: { transform: { react: { runtime: 'automatic' } } } }]
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/packages/crate'
};
