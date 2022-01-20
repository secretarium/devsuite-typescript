module.exports = {
    displayName: 'connector',
    preset: '../../jest.preset.js',
    transform: {
        '^.+\\.[tj]s$': '@swc/jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: '../../coverage/packages/connector',
};
