var path=require('path'),
    SERVER_ROOT=__dirname + "/../../../";

exports.production = {
	MONGO_CONSTRING: "mongodb://localhost/calcute",
    SERVER: {
        port: 8000,
        host: '0.0.0.0'
    },
    GATEWAY_URL: 'http://crm:8000/api/',
    GRUNT_TASKS: ['prod'],
    DEBUG: false
}

exports.stage = Object.create(exports.production);

exports.local = {
	MONGO_CONSTRING: "mongodb://localhost/calcute",
    SERVER: {
        port: 8080,
        host: '0.0.0.0'
    },
    GATEWAY_URL: 'http://debuggw.cube-group.ru',
    GATEWAY_USERNAME: 'cubegroup',
    GATEWAY_PASSWORD: 'mieSh2ut',
    GRUNT_TASKS: ['local'],
    DEBUG: true
}

exports.localnet = {
	MONGO_CONSTRING: "mongodb://localhost/calcute",
    SERVER: {
        port: 8080,
        host: '192.168.1.3'
    },
    GATEWAY_URL: 'http://debuggw.cube-group.ru',
    GATEWAY_USERNAME: 'cubegroup',
    GATEWAY_PASSWORD: 'mieSh2ut',
    GRUNT_TASKS: ['prod'],
    DEBUG: false
}
exports.test = {
	MONGO_CONSTRING: "mongodb://localhost/calcutetest"
}
