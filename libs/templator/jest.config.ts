/* eslint-disable */
export default {
    displayName: "templator",
    preset: "../../jest.preset.js",
    testEnvironment: "node",
    transform: {
        "^.+\\.[tj]sx?$": [
            "@swc/jest",
            { jsc: { transform: { react: { runtime: "automatic" } } } },
        ],
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    coverageDirectory: "../../coverage/libs/templator",
};
