'use strict';
module.exports = function initNgModule(ngModule){
    var mongoose = require('mongoose'),
        angular = require('angular'),
        assert = require('assert'),
        settings = require('settings'),
        pathUtil = require('../utils/schema-path.js'),
        schemas = require('../models/remote.js').schemas;

    ngModule.provider('models', function (){
        this.$get = function ($resource, $q) {
            var models = {
                $urlPrefix: settings.SERVICE_URL.replace(/\/$/, '') + '/models'
            };
            angular.forEach(schemas, function ( schema, name ) {
                /*
                var processResponse = [function(data, headersGetter){
                    var out = angular.fromJson(data);
                    if(angular.isArray(out)){
                        angular.forEach(out, function(opts, i, out){
                            var obj = new model(opts);
                            out[i] = obj;
                        });
                    }
                    else {
                        out = new model(out);
                    }
                    return out;
                }];
                */
                var transformRequest = [function(data, headersGetter){
                    var obj = {};
                    angular.forEach(data.schema.paths, function(path, name){ 
                        if(pathUtil.isMultiRef(path)){
                            obj[name] = data[name];
                        }
                        else {
                            data.$$doc[name] = data[name];
                            obj[name] = data.$$doc[name];
                        }
                    });
                    return JSON.stringify(obj);
                }];
                var transformResponse = [function(data, headersGetter){
                }]
                var actions = {
                    //'get': {method:'GET', transformResponse: processResponse },
                    //'query': {method:'GET', isArray:true, transformResponse: processResponse}
                    'save': {method:'POST', transformRequest: transformRequest}
                };
                angular.forEach(['queryPub', 'queryPubTop'], function (method) {
                    actions[method] = {
                        method: 'GET', 
                        isArray: true,
                        url: this.$urlPrefix + '/:name/action/:method',
                        params: {method: method},
                        //transformResponse: processResponse
                    };
                }, this);
                this[name] = class extends $resource(models.$urlPrefix + '/:name/:id', {name: name.toLowerCase(), id: '@_id'}, actions) {
                    constructor(opts){
                        super(opts);
                        this.$$doc = new mongoose.Document(opts, this.schema); 
                        angular.forEach(schema.methods, function(fn, name){
                            this[name] = angular.bind(this.$$doc, fn);
                        }, this);
                    }
                }
                this[name].prototype.schema = schema;
                //var super = this[name];
                /*
                angular.forEach(this[name].prototype.resource, function(fn, name){
                    this[name] = fn;
                }, this[name]);*/
                angular.forEach(schema.statics, function(fn, name){
                    this[name] = fn;
                }, this[name]);
            }, models);

            return models;
        };
    });

    angular.forEach(schemas, function ( schema, name ){
        ngModule.factory(name, function (models) {
            return models[name];
        });
    });
}
