const api = 'http://140.210.199.134:99/'
module.exports = {
    '/api/': {
        target: api,
        changeOrigin: true,
    },
    '/externalLink/': {
        target: api,
        changeOrigin: true,
    },
    '/apis/': {
        target: api,
        changeOrigin: true,
        pathRewrite: {
            '^/apis': '',
        },
    },
    '/v1/': {
        target: api,
        changeOrigin: true,
    },
}
