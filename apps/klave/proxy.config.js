/** @type {Record<string, import('http-proxy-middleware/dist/types').Options>} */
const options = {
    '/api': {
        target: 'http://127.0.0.1:3333',
        pathRewrite: path => {
            console.log('TOTOPLOP>', path)
            return path.replace(/^\/api/, '')
        },
        ws: true,
        logLevel: 'debug'
    }
};

module.exports = options;