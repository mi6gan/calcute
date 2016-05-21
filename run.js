var http    = require('http'),
    express = require('express'),
    fs      = require('fs'),
    angoose = require("angoose"),
    cors = require('cors'),
    Module = require('./models/protected/module.js'), 
    bodyParser = require('body-parser');

var settingsKey = process.argv.length>2 ? process.argv[2] : 'prod',
    settings = require('./settings.js')[settingsKey];


var app = express();

app.use(cors({
    origin: function(origin, callback) {
        if(origin) {
            var domain = origin.replace(/http(s|):\/\//, '');
            Module.findOne({ domains: { $all: [domain]} }, function(err, doc) {
                console.log(err, doc);
                if(err||!doc) {
                    callback(null, false);
                }
                else {
                    callback(null, true);
                }
            });
        }
        else {
            callback(null, false);
        }
    }
}));

app.use(bodyParser());
app.get('/', function(req, res){
    fs.readFile('../demo/index.html', function(err, page) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(page);
        res.end();
    });
});
angoose.init(app, {
    'module-dirs': './models/public',
    'mongo-opts': 'localhost/calcute',
    'logging': 'TRACE'
});
app.set('port', 8080);
app.use(express.static(__dirname + '/../'));

//---------run the server---------
(function(){
    var socketFile = settings.SERVER.socket;
    if(socketFile) {
        if(fs.existsSync(socketFile))
            fs.unlinkSync(socketFile);
        http.createServer(app).listen(socketFile);
        fs.writeFile(settings.SERVER.pidFile, process.pid);
    } else {
        http.createServer(app).listen(settings.SERVER.port, settings.SERVER.host);
    }
})();
