const git = require('git-rev-sync');
const { sentryEsbuildPlugin } = require('@sentry/esbuild-plugin');
const { nodeExternalsPlugin } = require('esbuild-node-externals');
const { version } = require('./package.json');

const klavenotifierSentryURL = process.env.PDA_NOTIFIER_SENTRY_DSN ? new URL(process.env.PDA_NOTIFIER_SENTRY_DSN) : null;

/** @type {import('esbuild').BuildOptions} */
module.exports = {
    sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : 'external',
    plugins: [
        nodeExternalsPlugin(),
        // Put the Sentry esbuild plugin after all other plugins
        klavenotifierSentryURL ? sentryEsbuildPlugin({
            url: `${klavenotifierSentryURL.protocol}//${klavenotifierSentryURL.host}`,
            org: process.env.PDA_NOTIFIER_SENTRY_ORG,
            project: process.env.PDA_NOTIFIER_SENTRY_PROJECT,
            authToken: process.env.PDA_NOTIFIER_SENTRY_AUTH_TOKEN,
            release: `notifier@${JSON.stringify(version)}`
        }) : undefined
    ].filter(Boolean),
    // Add extra external dependencies
    external: [
        '@sentry/node',
        'winston-transport'
    ],
    platform: 'node',
    loader: {
        // ensures .node binaries are copied to ./dist
        '.node': 'copy'
    },
    outExtension: {
        '.js': '.js'
    },
    bundle: true,
    define: {
        'process.env.NX_TASK_TARGET_PROJECT': JSON.stringify(process.env.NX_TASK_TARGET_PROJECT),
        'process.env.GIT_REPO_COMMIT': JSON.stringify(git.long('.')),
        'process.env.GIT_REPO_BRANCH': JSON.stringify(git.branch('.')),
        'process.env.GIT_REPO_DIRTY': JSON.stringify(git.isDirty()),
        'process.env.GIT_REPO_VERSION': JSON.stringify(version)
    }
};