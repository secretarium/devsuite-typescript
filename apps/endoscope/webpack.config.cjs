const path = require('node:path');
const { composePlugins, withNx } = require('@nx/webpack');
const { withReact } = require('@nx/react');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = composePlugins(
    withNx(),
    withReact(),
    (config, { options }) => {

        config.entry.panel = [path.resolve(__dirname, 'src/panel.tsx')];

        // TODO - There is a problem with module federation and the script type
        // https://github.com/angular-architects/module-federation-plugin/issues/96#issuecomment-977872267
        config.output.scriptType = 'text/javascript';

        if (config.devServer)
            config.devServer.devMiddleware.writeToDisk = true;

        config.plugins.push(
            new HtmlWebpackPlugin({
                title: 'Endoscope Panel',
                filename: 'panel.html',
                chunks: ['panel'],
                template: path.resolve(options.root, options.index)
            })
        );

        return config;
    }
);
