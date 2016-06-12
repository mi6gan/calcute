var path=require('path'),
    SERVER_ROOT=__dirname + "/../../../";

exports.prod = {
	MONGO_CONSTRING: "mongodb://localhost/calcute",
    SERVER: {
        socket: path.join(__dirname, '..', '..', '..', 'tmp', 'fcgi.sock'),
        pidFile: path.join(__dirname, '..', '..', '..', 'tmp', 'fcgi.pid')
    },
    GATEWAY_URL: 'http://debuggw.cube-group.ru',
    GATEWAY_USERNAME: 'cubegroup',
    GATEWAY_PASSWORD: 'mieSh2ut'
}

exports.local = {
	MONGO_CONSTRING: "mongodb://localhost/calcute",
    SERVER: {
        port: 8080,
        host: '0.0.0.0'
    },
    GATEWAY_URL: 'http://debuggw.cube-group.ru',
    GATEWAY_USERNAME: 'cubegroup',
    GATEWAY_PASSWORD: 'mieSh2ut'
}
