// import { composePlugins, withNx } from '@nrwl/webpack';
// import { withReact } from '@nrwl/react';

// const getWebpackConfig = composePlugins(withNx(), withReact(), (baseConfig) => {

//     if (!baseConfig.resolve)
//         baseConfig.resolve = {};
//     baseConfig.resolve.fallback = {
//         'bufferutil': false,
//         'buffer-util': false,
//         'utf-8-validate': false,
//         'zlib': false,
//         'stream': false,
//         'net': false,
//         'tls': false,
//         'crypto': 'crypto-browserify',
//         'http': false,
//         'https': false,
//         'url': false
//     };

//     baseConfig.ignoreWarnings?.push({
//         module: /packages\/klave\/src\/styles.css/,
//         message: /@import must precede all other statements/
//     });

//     console.log(JSON.stringify(baseConfig, null, 4));
//     return baseConfig;
// });

// export default getWebpackConfig;
