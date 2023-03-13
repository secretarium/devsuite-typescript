// const { composePlugins, withNx } = require('@nrwl/webpack');
// const { withReact } = require('@nrwl/react');

// // Nx plugins for webpack.
// module.exports = composePlugins(withNx(), withReact(), (config, { options, context }) => {
//     // Note: This was added by an Nx migration.
//     // You should consider inlining the logic into this file.
//     // For more information on webpack config and Nx see:
//     // https://nx.dev/packages/webpack/documents/webpack-config-setup
//     return require('./webpack.config')(config, context);
// });

const getNxReactWebpackConfig = require('@nrwl/react/plugins/webpack');

const getWebpackConfig = (config, context = {}) => {

    const baseConfig = getNxReactWebpackConfig({
        ...config,
        ignoreWarnings: [],
        plugins: [],
        module: {
            rules: []
        },
        resolve: {
            ...(config.resolve ?? {}),
            mainFields: []
        },
        optimization: {
            ...(config.optimization ?? {}),
            minimizer: []
        }
    }, context);

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

    baseConfig.ignoreWarnings.push({
        module: /src\/styles.css/,
        message: /@import must precede all other statements/
    });

    return baseConfig;
};

module.exports = getWebpackConfig;
