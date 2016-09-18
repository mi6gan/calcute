'use strict';
module.exports = function initNgModule(ngModule){
    var mongoose = require('mongoose'),
        angular = require('angular'),
        assert = require('assert'),
        settings = require('settings'),
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
                this[name] = function Model(opts){
                    this.resource.apply(this, arguments);
                    this.$$doc = new mongoose.Document(opts, this.schema); 
                    /*
                    angular.forEach(schema.paths, function(path, name){
                        Object.defineProperty(this, name, {
                            get: function(){
                                return this.$$doc[name];
                            },
                            set: function(value){
                                this.$$doc[name] = value;
                            }
                        });
                    }, this);*/
                    angular.forEach(schema.methods, function(fn, name){
                        this[name] = angular.bind(this.$$doc, fn);
                    }, this);
                };
                this[name].prototype.resource = $resource(models.$urlPrefix + '/:name/:id', {name: name.toLowerCase(), id: '@_id'}, actions);
                this[name].prototype.schema = schema;
                angular.forEach(this[name].prototype.resource, function(fn, name){
                    this[name] = fn;
                }, this[name]);
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
