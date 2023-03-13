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

const path = require('path');
const getNxReactWebpackConfig = require('@nrwl/react/plugins/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const getWebpackConfig = (config, context = {}) => {

    const baseConfig = getNxReactWebpackConfig(config, context);
    const baseOptions = { ...(context.buildOptions || {}), ...(context.options || {}) };

    baseConfig.entry.panel = [path.resolve(__dirname, 'src/panel.tsx')];

    if (baseConfig.devServer)
        baseConfig.devServer.devMiddleware.writeToDisk = true;

    baseConfig.plugins.push(new HtmlWebpackPlugin({
        title: 'Endoscope Panel',
        filename: 'panel.html',
        chunks: ['panel'],
        template: path.resolve(baseOptions.root, baseOptions.index)
    }));

    return baseConfig;
};

module.exports = getWebpackConfig;
