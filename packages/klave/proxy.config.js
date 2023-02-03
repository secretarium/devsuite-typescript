/** @type {Record<string, import('http-proxy-middleware/dist/types').Options>} */
const options = {
    '/api': {
        target: 'http://localhost:3333',
        pathRewrite: path => path.replace(/^\/api/, ''),
        ws: true
    }
};

module.exports = options;