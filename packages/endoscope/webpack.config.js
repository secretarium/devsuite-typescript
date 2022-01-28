const path = require('path');
const getNxReactWebpackConfig = require('@nrwl/react/plugins/webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { LicenseWebpackPlugin } = require('license-webpack-plugin');

const getWebpackConfig = (config, { buildOptions, options }) => {
    const baseConfig = getNxReactWebpackConfig(config);

    baseConfig.entry.panel = [path.resolve(__dirname, 'src/panel.tsx')];

    if (baseConfig.devServer) baseConfig.devServer.devMiddleware.writeToDisk = true;

    // TODO - We must temporarily remove license extraction
    baseConfig.plugins = baseConfig.plugins.filter((plugin) => !(plugin instanceof LicenseWebpackPlugin));

    const licensePluginLocation = baseConfig.plugins.findIndex((plugin) => !(plugin instanceof LicenseWebpackPlugin)) || baseConfig.plugins.length;
    baseConfig.plugins.splice(
        licensePluginLocation,
        0,
        new HtmlWebpackPlugin({
            title: 'Endoscope Panel',
            filename: 'panel.html',
            chunks: ['panel'],
            template: path.resolve(buildOptions?.root || options?.root, buildOptions?.index || options?.index),
        })
    );

    return baseConfig;
};

module.exports = getWebpackConfig;
