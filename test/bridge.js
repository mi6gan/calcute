var assert = require("assert"),
    bodyParser = require('body-parser'),
    Bridge = require('../lib/bridge.js'),
    express = require("express"),
    http = require('http'),
    sinon = require("sinon"),
    supertest = require("supertest"),
    mongoose = require('mongoose'),
    settings = require("../settings.js").test;

describe('models rest framework', function () {
    var bridge;
    var app;
    var server;
    before(function(done){
        app = express();
        app.use(bodyParser.urlencoded({extended: true}));
        app.use(bodyParser.json());
        bridge = new Bridge(app, {urlPrefix : '/models/'});
        server = http.createServer(app);
        server.listen(4000, function(){
            mongoose.connect(settings.MONGO_CONSTRING);
            done();
        });
    });
    after(function() {
        server.close();
    });
    describe('Feedback', function () {
        it('POST', function (done) {
            supertest(app)
                .post('/models/feedback')
                .send({
                    bank: "Сбербанк России",
                    capacity: "213",
                    car: {
                        label: "Car",
                        brand: {
                            label: "Brand"
                        }
                    },
                    city: "Москва",
                    credit: "Кредитное",
                    drivers: [],
                    franchise: "Да",
                    franchiseSum: 213,
                    fullName: "qeqw qweqe",
                    phoneNumber: "+7 (131) 231 23 12",
                    price: "от 500 тыс – 1 млн",
                    type: ["ДАГО (расширение ОСАГО)"],
                    year: "2001"
                })
                .end(function (err, res) {
                    if(err||res.error) {
                        return done(res.error ? (new Error(res.error.text)) : err);
                    }
                    return done();
                });
        });
    });
});
