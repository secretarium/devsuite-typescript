const merge = require('deepmerge');
const { getDefaultConfig } = require('@expo/metro-config');
const defaultConfig = getDefaultConfig(__dirname);

// defaultConfig.transformer.minifierConfig = merge(defaultConfig.transformer.minifierConfig, {
//     keep_classnames: true,
//     keep_fnames: true,
//     mangle: {
//         keep_classnames: true,
//         keep_fnames: true,
//     },
// });

module.exports = defaultConfig;
