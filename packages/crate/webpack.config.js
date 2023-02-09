const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');

module.exports = composePlugins(
    withNx(),
    withReact(),
    (config) => {

        config.resolve.fallback = {
            'bufferutil': false,
            'buffer-util': false,
            'utf-8-validate': false,
            'zlib': false,
            'stream': false,
            'net': false,
            'tls': false,
            'crypto': false,
            'http': false,
            'https': false,
            'url': false
        };

        return config;
    }
);
