const path = require('node:path');
const { composePlugins, withNx } = require('@nrwl/webpack');
const { withReact } = require('@nrwl/react');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = composePlugins(
    withNx(),
    withReact(),
    (config, { options }) => {

        config.entry.panel = [path.resolve(__dirname, 'src/panel.tsx')];

        if (config.devServer)
            config.devServer.devMiddleware.writeToDisk = true;

        config.plugins.push(new HtmlWebpackPlugin({
            title: 'Endoscope Panel',
            filename: 'panel.html',
            chunks: ['panel'],
            template: path.resolve(options.root, options.index)
        }));

        return config;
    }
);
