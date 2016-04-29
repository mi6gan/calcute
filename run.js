var http    = require('http'),
    express = require('express'),
    fs      = require('fs'),
    angoose = require("angoose"),
    bodyParser = require('body-parser');


var app = express();
app.use(bodyParser());
app.get('/', function(req, res){
    fs.readFile('../demo/index.html', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    });
});
angoose.init(app, {
    'module-dirs': './models',
    'mongo-opts': 'localhost/calcute',
    'logging': 'TRACE'
});
app.set('port', 8080);
app.use(express.static(__dirname + '/../'));
http.createServer(app).listen(8080);
