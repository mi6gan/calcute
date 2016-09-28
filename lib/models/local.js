"use strict";
(function initModule (schemas) {
    var mongoose = require('mongoose'),
        pathUtil = require('../utils/schema-path.js');
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
