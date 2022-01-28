const path = require('path');
const getNxReactWebpackConfig = require('@nrwl/react/plugins/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const getWebpackConfig = (config, { buildOptions, options }) => {

    const baseConfig = getNxReactWebpackConfig(config);
    const baseOptions = { ...(buildOptions || {}), ...(options || {}) };

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
