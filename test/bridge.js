var assert = require("assert"),
    bodyParser = require('body-parser'),
    Bridge = require('../lib/bridge.js'),
    models = require('../models/local.js'),
    express = require("express"),
    http = require('http'),
    sinon = require("sinon"),
    supertest = require("supertest"),
    mongoose = require('mongoose'),
    expect = require('chai').expect,
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
                    drivers: [
                        {age: 21, experience: 2, gender: 'Муж'},
                        {age: 31, experience: 6, gender: 'Жен'}
                    ],
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
    describe('Driver', function () {
        it('age validation', function (done) {
            var driver = new models.Driver({age: 17});
            driver.validate(function(err) {
                expect(err.errors).to.exist;
                expect(err.errors.age).to.exist;
                expect(err.errors.age.kind).to.equal('too small');
                driver.age = 18;
                driver.validate(function(err) {
                    expect(err.errors.age).to.not.exist;
                    done();
                });
            });
        })
        it('experience validation', function (done) {
            var driver = new models.Driver({age: 20, experience: 3});
            driver.validate(function(err) {
                expect(err.errors).to.exist;
                expect(err.errors.experience).to.exist;
                expect(err.errors.experience.kind).to.equal('not fits the age');
                driver.experience = 1;
                driver.validate(function(err) {
                    expect(err).to.not.exist;
                    done();
                });
            });
        });
    });
});
