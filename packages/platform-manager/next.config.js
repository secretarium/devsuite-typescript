//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nrwl/next/plugins/with-nx');

/**
 * @type {import('@nrwl/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
    nx: {
        // Set this to true if you would like to to use SVGR
        // See: https://github.com/gregberge/svgr
        svgr: false
    },
    reactStrictMode: true,
    /** Enables hot reloading for local packages without a build step */
    transpilePackages: ['@secretarium/hubber-api', '@secretarium/hubber-auth', '@secretarium/hubber-db'],
    /** We already do linting and typechecking as separate tasks in CI */
    serverRuntimeConfig: {
        // Will only be available on the server side
    },
    publicRuntimeConfig: {
        // Will be available on both server and client
        APP_URL: process.env.APP_URL,
        WS_URL: process.env.WS_URL
    },
    eslint: {
        ignoreDuringBuilds: !!process.env.CI
    },
    typescript: {
        ignoreBuildErrors: !!process.env.CI
    },
    experimental: {
        appDir: true
    }
};

module.exports = withNx(nextConfig);
