var http    = require('http'),
    request = require('request'),
    express = require('express'),
    fs      = require('fs'),
    angoose = require("angoose"),
    Feedback = require("./models/public/feedback.js").Feedback,
    cors = require('cors'),
    Module = require('./models/protected/module.js'), 
    bodyParser = require('body-parser');

var settingsKey = process.argv.length>2 ? process.argv[2] : 'prod',
    settings = require('./settings.js')[settingsKey];

//====== initialize express app =======
var app = express();

app.use(cors({
    origin: function(origin, callback) {
        if(origin) {
            var domain = origin.replace(/http(s|):\/\//, '');
            Module.findOne({ domains: { $all: [domain]} }, function(err, doc) {
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
//====== db events =======
Feedback.schema.post('save', function(doc) {
    doc.populate('car', function(err, doc) {
     doc.car.populate('brand', function(err, car) {
	    var username = settings.GATEWAY_USERNAME,
	        password = settings.GATEWAY_PASSWORD,
	        url = settings.GATEWAY_URL.replace(/[\/]+$/g, '') + '/crm/kk/seo/feedback',
	        typeChoices = Feedback.schema.paths.type.options.choices,
	        legacyData = {
	            mk: car.brand.label + ' ' + car.label,
	            phone: doc.phoneNumber,
	            name: doc.fullName,
	            year: doc.year,
	            capacity: doc.capacity,
	            cost: doc.price.label,
	            city: doc.city.label,
	            drivers_count: doc.driversCount,
	            is_kasko: doc.type && (doc.type.label == typeChoices[0].label),
	            is_osago: doc.type && (doc.type.label == typeChoices[1].label),
	            is_osago_extension: doc.type && (doc.type.label == typeChoices[2].label),
	            is_accident: doc.type && (doc.type.label == typeChoices[2].label)
	        },
	        data = {
	            number: 999999 + parseInt(doc._id.str.substring(9*2), 16),
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
                console.log(arguments);
            });
	    if (username) {
            post = post.auth(username, password);
	    }
     });
    });
});

//====== run the server =========
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
