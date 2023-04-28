const { join } = require('path');
const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');

module.exports = {
    content: [
        ...createGlobPatternsForDependencies(__dirname),
        join(__dirname, 'src/**/*.{js,ts,jsx,tsx}')
    ],
    darkMode: 'media',
    theme: {
        extend: {}
    },
    variants: {
        extend: {}
    },
    plugins: []
};
