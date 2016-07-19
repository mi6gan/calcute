"use strict";
(function initModule (schemas) {
    var mongoose = require('mongoose');
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
                            }},
                            {$sort: {
                                label: 1
                            }}
                        ]).exec(cb);
                    };
                    schema.statics.queryPub = function(query, cb) {
                        this.aggregate([
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
