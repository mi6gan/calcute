module.exports = {
	MONGO_CONSTRING: "mongodb://mongo/calcute",
    SERVER: {
        port: 8000,
        host: '0.0.0.0'
    },
    GATEWAY_URL: 'http://crm:8000/api/',
    GRUNT_TASKS: ['production'],
    DEBUG: false
}
