const merge = require('deepmerge');
const { resolve } = require('path');
const { withNxMetro } = require('@nrwl/expo');
const { getDefaultConfig } = require('@expo/metro-config');
const { createProjectGraphAsync } = require('nx/src/project-graph/project-graph');

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

    const { nodes } = await createProjectGraphAsync();
    const libsEntries = Object.entries(nodes).filter(([, value]) => value.type === 'lib');
    const watchFolders = libsEntries.map(libEntry => resolve(__dirname, '../../packages', libEntry[0]));

    return withNxMetro(defaultConfig, {
        // Change this to true to see debugging info.
        // Useful if you have issues resolving modules
        debug: false,
        // all the file extensions used for imports other than 'ts', 'tsx', 'js', 'jsx'
        extensions: [],
        // the project root to start the metro server
        projectRoot: __dirname,
        // Specify any additional (to projectRoot) watch folders, this is used to know which files to watch
        watchFolders
    });
})();
