"use strict";
(function initModule (schemas) {
    var mongoose = require('mongoose'),
        pathUtil = require('../utils/schema-path.js'),
        settings = require('../../settings/index.js'),
        request = require('request');
    mongoose.plugin(require('mongoose-id-validator'));
    schemas.Module = new mongoose.Schema({
        name: {type: String},
        domains: [String]
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
                    var feedback = this;
                    return new Promise(function(resolve, reject){
                     feedback.populate('car', function(err) {
                      feedback.car.populate('brand', function(err) {
                	    var username = settings.GATEWAY_USERNAME,
                	        password = settings.GATEWAY_PASSWORD,
                	        url = settings.GATEWAY_URL.replace(/[\/]+$/g, '') + '/api/projects/kk/feedbacks/',
                	        legacyData = {
                	            mk: feedback.car.brand.label + ' ' + feedback.car.label,
                	            phone: feedback.phoneNumber,
                	            name: feedback.fullName,
                	            year: feedback.year,
                	            capacity: feedback.capacity,
                	            cost: feedback.price,
                	            city: feedback.city,
                	            drivers_count: feedback.driversCount,
                	            is_kasko: false,
                	            is_osago: false,
                	            is_osago_extension: false,
                	            is_accident: false
                	        };
                        if( feedback.type ) {
                	        feedback.type.forEach( function (v) {
                                switch(schemas.Feedback.paths.type.options.enum.indexOf(v)) {
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
                            });
                        }
                	    var data = {
                	        number: 999999 + parseInt(feedback._id.toString().substring(9*2), 16),
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
                            seo_query: null,
                            utms: '{}',
                	        form_url: '/'
                	    },
                        post = request.post(url, { form: data }, function(err){
                            if(err){reject(err);}
                            else{resolve();}
                        });
                	    if (username) {
                            post.auth(username, password);
                	    }
                     });
                    });
                   });
                  };
                case 'DiscountInfo':
                    schema.statics.parseInitOpts = function parseInitOpts(obj, cb) {
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
            this[name] = mongoose.model(name, schemas[name]);
        }
    }
    return schemas;
}).call(
    module.exports,
    require('./portable.js').schemas
);
