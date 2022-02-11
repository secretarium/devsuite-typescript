const merge = require('deepmerge');
const { withNxMetro } = require('@nrwl/expo');
const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);


module.exports = (async () => {

    defaultConfig.transformer.babelTransformerPath = require.resolve(
        'react-native-svg-transformer'
    );
    defaultConfig.transformer.minifierConfig = merge(defaultConfig.transformer.minifierConfig, {
	    keep_classnames: true,
	    keep_fnames: true,
	    mangle: {
	        keep_classnames: true,
	        keep_fnames: true
	    }
    });
    defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
        (ext) => ext !== 'svg'
    );
    defaultConfig.resolver.sourceExts.push('svg');

    return withNxMetro(defaultConfig, {
        // Change this to true to see debugging info.
        // Useful if you have issues resolving modules
        debug: false,
        // all the file extensions used for imports other than 'ts', 'tsx', 'js', 'jsx'
        extensions: []
    });
})();
