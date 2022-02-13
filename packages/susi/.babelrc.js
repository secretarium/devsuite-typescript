const path = require('path');

module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            'react-native-reanimated/plugin',
            path.resolve(__dirname, '../babel-plugin-dotenv-inject')
        ]
    };
};
