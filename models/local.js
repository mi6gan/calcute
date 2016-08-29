"use strict";
(function initModule (schemas) {
    var mongoose = require('mongoose');
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
                    schema.statics.parseInitOpts = function parseInitOpts(opts, cb) {
                        var promises = [];
                        for(var pathName in opts) {
                            var pathOpts = opts[pathName],
                                path = schema.paths[pathName];
                            if(path instanceof Object && path.options.type instanceof Array && path.options.type.length) { 
                                var modelName = path.options.type[0].ref,
                                    model = mongoose.model(modelName, schemas[modelName]),
                                    refList = [];
                                if(model) {
                                    for(var k in pathOpts) {
                                        var i = parseInt(k);
                                        if(!isNaN(i)) {
                                            if(i >= refList.length) {
                                                for(var j=0; j<=i; j++) {
                                                    refList.push(null);
                                                }
                                            }
                                            var refInstance = new model(pathOpts[k]);
                                            promises.push(new Promise(function (resolve, reject) {
                                                refInstance.save(function(err, doc) {
                                                    if(err) {
                                                        reject(err);
                                                    }
                                                    else {
                                                        resolve(doc);
                                                    }
                                                });
                                            }));
                                        }
                                        refList[refList.length-1] = refInstance._id;
                                    }
                                }
                                opts[pathName] = refList;
                            }
                        }
                        if(opts.car&&typeof(opts.car)=='object') {
                            var Car = mongoose.model('Car', schemas.Car),
                                onBrandReady = function (cb){cb(null, opts.car.brand);};
                            if(opts.car.brand&&typeof(opts.car.brand)=='object') {
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
