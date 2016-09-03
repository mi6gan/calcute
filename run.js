var models = require("./models/local.js"),
    fs     = require('fs');
var settingsKey = process.argv.length>2 ? process.argv[2] : 'prod',
    settings = require('./settings.js')[settingsKey];
(function runServer(){
    var initModels = new Promise(function initModels(resolve) {
      var request = require('request'),
          mongoose = require('mongoose'),
          remote = require("./models/remote.js");
      console.log('initalizing db and models...');
      remote.schemas.Feedback.post('save', function(doc) {
        doc.populate('car', function(err, car) {
         car.populate('brand', function(err, brand) {
    	    var username = settings.GATEWAY_USERNAME,
    	        password = settings.GATEWAY_PASSWORD,
    	        url = settings.GATEWAY_URL.replace(/[\/]+$/g, '') + '/crm/kk/seo/feedback',
    	        legacyData = {
    	            mk: brand.label + ' ' + car.label,
    	            phone: doc.phoneNumber,
    	            name: doc.fullName,
    	            year: doc.year,
    	            capacity: doc.capacity,
    	            cost: doc.price.label,
    	            city: doc.city.label,
    	            drivers_count: doc.driversCount,
    	            is_kasko: false,
    	            is_osago: false,
    	            is_osago_extension: false,
    	            is_accident: false
    	        };
                if( doc.type ) {
    	            doc.type.forEach( function (v) {
                        switch(remote.schemas.Feedback.paths.type.options.enum.indexOf(v)) {
                            case 0:
                                legacyData.is_kasko = true;
                                break;
                            case 1:
                                legacyData.is_osago = true;
                                break;
                            case 2:
                                legacyData.is_osago_extension = true;
                                legacyData.is_accident = true;
                                break;
                        }
                    } );
                }
    	        var data = {
    	            number: 999999 + parseInt(doc._id.toString().substring(9*2), 16),
    	            excerpt: (function() {
    	                var s = [];
    	                if(legacyData.is_osago) {
    	                    s.push('ОСАГО');
    	                }
    	                if(legacyData.is_kasko) {
    	                    s.push('КАСКО');
    	                }
    	                if(legacyData.is_osago_extension) {
    	                    s.push('Расширение');
    	                }
    	                if(legacyData.is_accident) {
    	                    s.push('Несчастный случай');
    	                }
    	                return s.join(', ');
    	            })(),
    	            data: JSON.stringify(legacyData),
    	            form_url: '/'
    	        },
    	        form = {
    	            schedule: true,
    	            data: JSON.stringify(data) 
    	        },
                post = request.post(url, { form: form }, function() {
                });
    	    if (username) {
                post = post.auth(username, password);
    	    }
         });
        });
      });
      mongoose.Promise = Promise;
      mongoose.connect(settings.MONGO_CONSTRING).then(function () {
          console.log('connected to ' + settings.MONGO_CONSTRING);
          resolve();
      });
    });
    var browserifySrc = new Promise(function browserifySrc(resolve) {
        var browserify = require('browserify');
        console.log('browserifying sources...');
        var browserifier = browserify(),
            jsStream = fs.createWriteStream('./static/build/calcute.js');
        browserifier.add('node_modules/mongoose/lib/browser.js', {'expose': 'mongoose'});
        browserifier.add('./lib/settings/' + settingsKey + '.js', {'expose': 'settings'});
        browserifier.add('./lib/angular-models.js');
        jsStream.on('finish', function () {
            resolve();
            console.log('sources ready for a browser');
        });
        browserifier.bundle().pipe(jsStream);
    });
    var gruntBuild = new Promise(function gruntBuild(resolve) {
        var init = require('./Gruntfile.js'),
            grunt = require('grunt');
        console.log('running grunt tasks...');
        init(grunt);
        grunt.tasks(settings.GRUNT_TASKS, {}, function () {
            resolve();
            console.log('grunt tasks finished');
        });
    });
    var initServer = new Promise(function initServer(resolve, reject) {
        var http    = require('http'),
            express = require('express'),
            cors = require('cors'),
            bodyParser = require('body-parser'),
            Bridge = require('./lib/bridge.js');
        var socketFile = settings.SERVER.socket,
            app = express(),
            server;
        app.use(cors({
            origin: function(origin, callback) {
                if(origin) {
                    var domain = origin.replace(/http(s|):\/\//, '');
                    models.Module.findOne({ domains: { $all: [domain]} }, function(err, doc) {
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
        app.use(bodyParser.urlencoded({
              extended: true
        }));
        app.use(bodyParser.json());
        
        app.get('/demo', function(req, res){
            fs.readFile('demo/index.html', function(err, page) {
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
        app.set('port', 8080);
        app.use(express.static(__dirname + '/static/build'));
        
        
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
            else{resolve();}
        });
    });

    Promise.all([
        initModels,
        browserifySrc,
        gruntBuild,
        initServer
    ]).then(function onFullfilled() {
        console.log('\n* ready for connections');
    }, function onRejected(err) {
        console.log(err);
        //TODO send some log info
        process.exit();
    });
})();
