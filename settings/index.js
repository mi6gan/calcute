var path=require('path'),
    SERVER_ROOT=__dirname + "/../../../";

exports.prod = {
	MONGO_CONSTRING: "mongodb://localhost/calcute",
    SERVER: {
        socket: path.join(__dirname, '..', '..', '..', '..', 'tmp', 'fcgi.sock'),
        pidFile: path.join(__dirname, '..', '..', '..', '..', 'tmp', 'fcgi.pid')
    },
    GATEWAY_URL: 'http://localhost:8080/local/crm',
    GRUNT_TASKS: ['prod'],
    DEBUG: false
}

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
