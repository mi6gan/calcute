module.exports = {
	MONGO_CONSTRING: "mongodb://mongo/calcute",
    SERVER: {
        port: 8000,
        host: '0.0.0.0'
    },
    GATEWAY_URL: 'http://crm:8000/',
    DEBUG: false,
    POST_AFTER_MS: 4*60*1000
}
