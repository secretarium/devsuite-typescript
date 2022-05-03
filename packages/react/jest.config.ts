module.exports = {
    displayName: 'react',
    preset: '../../jest.preset.ts',
    transform: {
        '^.+\\.[tj]sx?$': 'babel-jest'
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../coverage/packages/react'
};
