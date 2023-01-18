const getNxReactWebpackConfig = require('@nrwl/react/plugins/webpack');

const getWebpackConfig = (config) => {

    const baseConfig = getNxReactWebpackConfig(config);

    baseConfig.resolve.fallback = {
        'bufferutil': false,
        'buffer-util': false,
        'utf-8-validate': false,
        'zlib': false,
        'stream': false,
        'net': false,
        'tls': false,
        'crypto': 'crypto-browserify',
        'http': false,
        'https': false,
        'url': false
    };

    return baseConfig;
};

module.exports = getWebpackConfig;
