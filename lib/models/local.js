"use strict";
(function initModule (schemas) {
    var mongoose = require('mongoose'),
        pathUtil = require('../utils/schema-path.js'),
        modelsUtil = require('../utils/models.js'),
        settings = require('../../settings/index.js'),
        request = require('request');
    mongoose.plugin(require('mongoose-id-validator'));
    schemas.Module = new mongoose.Schema({
        name: {type: String},
        domains: [String],
        jsAssets: [String],
        cssAssets: [String]
    });
    for(var name in schemas) {
        if( name == 'schemas' ) {
            console.warn('skipping schema with hash key "schemas"');
        }
        else {
            var schema = schemas[name];
            switch(name) {
                case 'Feedback':
                  schema.methods.postToCRM = function(){
                    var feedback = this, postCallback = (function(feedback, reject, resolve, err, response){
                        if(response&&response.statusCode!=201){
                            err = response.statusCode;
                        }
                        if(!err) {
                            feedback.update({emitted: true}, function(err, doc){
                                if(err){resolve(err);}
                                else {resolve();}
                            });
                        }
                        else {
                            if(settings.DEBUG){
                                console.log(err);
                                if(response){
                                    var fs = require('fs');
                                    fs.writeFileSync('./log.html', response.body);
                                }
                            }
                            reject(err);
                        }
                   });
                   return new Promise(function(resolve, reject){
                     var DiscountInfo = mongoose.model('DiscountInfo'),
                         Feedback = mongoose.model('Feedback'),
                	     data = {
                            number: 999999 + parseInt(feedback._id.toString().substring(9*2), 16),
                            seo_query: null,
                            utms: '{}',
                	        form_url: '/',
                            data: {}
                         };
                     if( feedback.type ) {
                	    feedback.type.forEach( function (v) {
                            switch(schemas.Feedback.paths.type.options.enum.indexOf(v)) {
                                case 0:
                                    data.data.is_kasko = true;
                                break;
                                case 1:
                                    data.data.is_osago = true;
                                break;
                                case 2:
                                    data.data.is_osago_extension = true;
                                    data.data.is_accident = true;
                                break;
                            }
                        });
                     }
                     (new Promise(function(resolve, reject){
                       modelsUtil.clean(Feedback, feedback, [], 2).then(function(cFeedback){
                           console.log(cFeedback);
                	    Object.assign(data.data, {
                              bank: cFeedback.bank,
                	          capacity: cFeedback.capacity,
                	          city: cFeedback.city,
                	          cost: cFeedback.price,
                	          drivers: cFeedback.drivers,
                              franchise: cFeedback.franchise,
                              franchiseSum: cFeedback.franchiseSum,
                	          is_accident: false,
                              is_calcute: true,
                              is_credit: cFeedback.credit,
                	          is_kasko: false,
                	          is_osago: false,
                	          is_osago_extension: false,
                              mk: cFeedback.car ? (cFeedback.car.brand ? (cFeedback.car.brand.label + ' ' + cFeedback.car.label) : cFeedback.car.fullLabel ) : 'unknown',
                	          name: cFeedback.fullName,
                	          phone: cFeedback.phoneNumber,
                              price: cFeedback.price,
                	          year: cFeedback.year,
                	    });
                        DiscountInfo.findOne({feedback: mongoose.Types.ObjectId(feedback._id)}).then(function(discount){
                            if(discount) {
                                modelsUtil.clean(DiscountInfo, discount, [Feedback], 1).then(function(cDiscount){
                                    data.data.discount = cDiscount;
                                    resolve(data);
                                }, function(err){
                                    reject(err);
                                });
                            }
                            else {resolve(data);}
                        });
                     },function(err){
                         reject(err);
                     });
                    })).then(function(data){
                	  var username = settings.GATEWAY_USERNAME,
                	      password = settings.GATEWAY_PASSWORD,
                	      url = settings.GATEWAY_URL.replace(/[\/]+$/g, '') + '/api/projects/kk/feedbacks/';
                      data.data = JSON.stringify(data.data);
                      console.log(data.data);
                      //request.post(url, { form: data }, postCallback.bind(this, feedback, reject, resolve)).auth(username, password); 
                    }, function(err){
                      reject(err);
                    });
                  });
                 };
                case 'DiscountInfo':
                    schema.statics.parseInitOpts = function parseInitOpts(obj, cb){
                        var promises = [],
                            schema = this.schema;
                        for(var pathName in obj) {
                            var pathVal = obj[pathName],
                                path = schema.paths[pathName];
                            if(pathUtil.isMultiRef(path)){
                                var modelName = path.options.type[0].ref,
                                    refList = [];
                                if(!modelName) {
                                    continue;
                                }
                                var model = mongoose.model(modelName, schemas[modelName]);
                                for(var i in pathVal) {
                                    i = parseInt(i);
                                    if(!isNaN(i)) {
                                        var refObj = pathVal[i],
                                            id = refObj._id;
                                        if(i >= refList.length) {
                                            for(var j=refList.length; j<=i; j++) {
                                                refList.push(null);
                                            }
                                        }
                                        promises.push(new Promise(function (resolve, reject) {
                                            if(id){
                                                var cleaned = {};
                                                for(k in refObj){
                                                    if((k in schema.paths)&&(k!='_id')){
                                                        cleaned[k] = refObj[k];
                                                    }
                                                }
                                                model.update({_id: id}, cleaned, function(err, doc){
                                                    if(err) {reject(err);}
                                                    else {resolve(doc);}
                                                });
                                            } else {
                                                var refInstance = new model(refObj);
                                                refInstance.save(function(err, doc) {
                                                    if(err) {reject(err);}
                                                    else {resolve(doc);}
                                                });
                                                id = refInstance._id;
                                            }
                                        }));
                                        refList[i] = id;
                                    }
                                }
                                obj[pathName] = refList;
                            }
                        }
                        if(name=='Feedback'&&opts.car&&typeof(opts.car)=='object') {
                            var Car = mongoose.model('Car', schemas.Car),
                                onBrandReady = function (cb){cb(null, opts.car.brand);};
                            if(opts.car.brand&&typeof(opts.car.brand)=='object'&&!opts.car.brand._id) {
                                var CarBrand = mongoose.model('CarBrand', schemas.CarBrand),
                                    brand = new CarBrand(opts.car.brand);
                                onBrandReady = function (cb) {
                                    brand.save(function (err, doc) {
                                        cb(err, doc);
                                    });
                                }
                            }
                            promises.push(new Promise(function (resolve, reject) {
                              onBrandReady(function (err, brand) {
                                if(!err) {
                                    opts.car.brand = brand._id;
                                    if('_id' in opts.car) {
                                        delete opts.car._id;
                                    }
                                    var car = new Car(opts.car);
                                    car.save(function (err, car) {
                                        if(err) {
                                            reject(err);
                                        }
                                        else {
                                            opts.car = car._id;
                                            resolve(car);
                                        }
                                    });
                                }
                              });
                            }));
                        }
                        Promise.all(promises).then(function (doc) {
                            cb(null, doc);
                        }, function (err) {
                            cb(err, null);
                        });
                    };
                    break;
                case 'CarBrand':
                    schema.statics.queryPubTop = function(query, cb) {
                        this.aggregate([
                            {$match: {
                                icon: {
                                    $not: {
                                        $in: [null, '']
                                    },
                                    $exists: true
                                },
                                $or: [{isDraft: {$in: [null, false, '']}}, {isDraft: {$exists: false}}]
                            }},
                            {$sort: {
                                label: 1
                            }}
                        ]).exec(cb);
                    };
                    schema.statics.queryPub = function(query, cb) {
                        this.aggregate([
                            {$match: {
                                $or: [{isDraft: {$in: [null, false, '']}}, {isDraft: {$exists: false}}]
                            }},
                            {$sort: {
                                label: 1
                            }}
                        ]).exec(cb);
                    };
                    break;
                case 'Car':
                    schema.statics.queryPub = function(query, cb) {
                        this.aggregate([
                            {$match: {
                                'brand': mongoose.Types.ObjectId(query.brandId)
                            }},
                            {$sort: {
                                label: 1
                            }}
                        ]).exec(function(err, docs) {
                            var Value = function () {
                            };
                            Value.prototype.toJSON = function() {
                                return this.v;
                            };
                            var value = new Value();
                            value.v = docs.reduce(function(len, doc){
                                doc.maxLength = value;
                                return (value.v = Math.max(doc.label.length, len));
                            }, 0);
                            cb(err, docs);
                        });
                    };
                    break;
                case 'Company':
                    schema.statics.queryPub = function(query, cb) {
                        this.aggregate([
                            {$match: {
                                $or: [{isDraft: {$in: [null, false, '']}}, {isDraft: {$exists: false}}]
                            }},
                            {$sort: {
                                title: 1
                            }}
                        ]).exec(cb);
                    };
                    break;
                default:
                    // methods for all schemas
                    break;
            }
        }
        this[name] = mongoose.model(name, schemas[name]);
    }
    return schemas;
}).call(
    module.exports,
    require('./portable.js').schemas
);
