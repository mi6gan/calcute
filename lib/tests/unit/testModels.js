/* TODO fix shitty bug with refArray update (drivers for Feedback and DiscountInfo) */
var expect = require('chai').expect,
    should = require('chai').should,
    server = require('../../../server.js'),
    app, models,
    settings = {
        MONGO_CONSTRING: 'localhost/calcutetest',
        SERVER: {
            port: 4444,
            host: '0.0.0.0'
        },
        DEBUG: true
    },
    supertest = require("supertest"),
    intialData = require('../../../commands/load-initial-data.js');
describe('test models', function() {
    this.timeout(5000);
    before(function(done){
        Promise.all([
            server.initModels(settings),
            server.initServer(settings)
        ]).then(function(args){
            models = args[0];
            app = args[1];
            Promise.all([
                models.DiscountInfo.remove({}),
                models.Feedback.remove({}),
                models.Driver.remove({})
            ]).then(
            function(){
                done();
            }, function(err){
                done(err);
            });
        }, function(err){
            done(err);
        });
    });
    afterEach(function(done){
        models.Feedback.remove({}, done);
    });
    var feedback = {
        car: {
            fullLabel: 'test car',
        },
        year: '2000',
        capacity: 1000,
        price: 'до 500 тыс',
        credit: "Кредитное",
        bank: "Сбербанк России",
        city: "Москва",
        drivers: [{
            gender: 'Муж',
            age: '21',
            experience: '2'
        }],
        phoneNumber: '+71234567890',
        fullName: 'Name Surname',
        franchise: 'Нет',
        year: '2016',
        type: 'КАСКО'
    }, discount = {
    };
    it('save feedback with multiref', function(done){
        supertest(app)
         .post('/models/feedback')
         .send(feedback)
         .expect(200, function(err, response){
            if(err){
                console.log(response.body);
            }
            done(err);
         });
    });
    it('save feedback->drivers<-discountinfo', function(done){
        var testapp = supertest(app);
        testapp
         .post('/models/feedback')
         .send(feedback)
         .expect(200, function(err, response){
             if(err){done(err);}
             else {
              models.Feedback.findOne({}).then(function(fDoc){
                discount.drivers = fDoc.drivers.map(function(id){
                    return {_id: id, licence: '1234 567890'};
                });
                discount.feedback = fDoc._id;
                testapp
                 .post('/models/discountinfo')
                 .send(discount)
                 .expect(200, function(err, response){
                    if(err){
                        done(err);
                    }
                    else {
                      models.DiscountInfo.findOne({}).then(function(dDoc){
                        try {
                          dDoc.populate('drivers', function(){
                            expect(dDoc.licence).to.equal(discount.license);
                          });
                        } catch(err) { done(err); return; }
                        done();
                      }, done);
                    }
                 });
              }.bind(this), done);
             }
         });
    });
});
