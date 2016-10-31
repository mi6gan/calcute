var models = require("./lib/models/local.js"),
    fs     = require('fs');
(function runServer(){
    var initModels = function(settings){return new Promise(function initModels(resolve) {
      var request = require('request'),
          mongoose = require('mongoose'),
          remote = require("./lib/models/remote.js");
      console.log('initalizing db and models...');
      settings = settings || require('./settings/index.js');
      models.init(settings);
      mongoose.Promise = Promise;
      mongoose.connect(settings.MONGO_CONSTRING).then(function () {
        console.log('connected to ' + settings.MONGO_CONSTRING);
        resolve(models);
      });
    })};
    var gruntBuild = function(settings){return new Promise(function gruntBuild(resolve) {
        var init = require('./Gruntfile.js'),
            grunt = require('grunt');
        console.log('running grunt tasks...');
        settings = settings || require('./settings/index.js');
        init(grunt, settings);
        grunt.tasks(['default'], {}, function () {
            resolve();
            console.log('grunt tasks finished');
        });
    })};
    var initServer = function(settings){ return new Promise(function initServer(resolve, reject) {
        var http    = require('http'),
            express = require('express'),
            cors = require('cors'),
            bodyParser = require('body-parser'),
            Bridge = require('./lib/bridge.js'),
            nunjucks = require('nunjucks');
        settings = settings || require('./settings/index.js');
        var socketFile = settings.SERVER.socket,
            app = express(),
            server;
        nunjucks.configure(['']);
        nunjucks.configure({noCache: settings.DEBUG});
        app.use(cors({
            origin: function(origin, callback) {
                if(origin) {
                    var domain = origin.replace(/http(s|):\/\//, '').split(':')[0];
                    models.Module.findOne({ domains: { $all: [domain]} }, function(err, doc) {
                        if(err||!doc) {callback(null, false);}
                        else {callback(null, true);}
                    });
                }
                else {
                    callback(null, false);
                }
            }
        }));
        app.use(bodyParser.urlencoded({
              extended: true
        }));
        app.use(bodyParser.json());
        app.get('/demo', function(req, res){
            nunjucks.render('assets/calcute/templates/index.html', {settings: settings}, function(err, page) {
                res.writeHead(200, {'Content-Type': 'text/html'});
                res.write(page);
                res.end();
            });
        });
        app.post('/local/crm', function(req, res){
            var body = {result: 'ok'};
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.write(JSON.strinfigy(body));
            res.end();
        });
        app.use(express.static(__dirname + '/build'));
        app.use(express.static(__dirname + '/assets'));
        
        
        var bridge = new Bridge(app, {
            urlPrefix : '/models/'
        });
        if(socketFile) {
            if(fs.existsSync(socketFile)) {
                fs.unlinkSync(socketFile);
            }
            server = http.createServer(app).listen(socketFile);
            fs.writeFile(settings.SERVER.pidFile, process.pid);
        } else {
            server = http.createServer(app);
        }
        server.listen(settings.SERVER.port, settings.SERVER.host, function (err) {
            if(err){reject(err);}
            else{resolve(app);}
        });
    })};
    if(require.main==module){
        Promise.all([
            initModels(),
            //gruntBuild(),
            initServer()
        ]).then(function onFullfilled() {
            console.log('\n* ready for connections');
        }, function onRejected(err) {
            console.log(err);
            process.exit();
        });
    } else {
        module.exports = {
            initModels: initModels,
            initServer: initServer
        };
    }
})();
