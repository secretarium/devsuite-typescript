const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

module.exports = composePlugins(
    withNx(),
    withReact(),
    (config) => {
        return config;
    }
);
