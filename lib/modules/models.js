(function () {
    'use strict';
    var mongoose = require('mongoose'),
        angular = require('angular'),
        settings = require('settings'),
        ngResource = require('angular-resource'),
        schemas = require('../models/remote.js').schemas,
        ngModule = angular.module('models', ['ngResource']);
    ngModule.provider('models', function () {
        this.$get = function ($resource) {
            var models = {
                $urlPrefix: settings.SERVICE_URL.replace(/\/$/, '') + '/models'
            };
            models.$resource = angular.bind(this, $resource, models.$urlPrefix + '/:name/:id');
            angular.forEach(schemas, function ( schema, name ) {
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
                var actions = {
                    'get': {method:'GET', transformResponse: processResponse },
                    'query': {method:'GET', isArray:true, transformResponse: processResponse}
                };
                angular.forEach(['queryPub', 'queryPubTop'], function (method) {
                    actions[method] = {
                        method: 'GET', 
                        isArray: true,
                        url: this.$urlPrefix + '/:name/action/:method',
                        params: {method: method},
                        transformResponse: processResponse
                    };
                }, this);
                schema.resource = this.$resource({name: name.toLowerCase(), id: '@_id'}, actions);
                angular.forEach(schema.resource.prototype, function(method, name) {
                    if(name[0]=='$'){
                        this.statics[name] = method; 
                    }
                    else {
                        this.methods[name] = method; 
                    }
                }, schema);
                //schema.statics = 
                /*
                        super.constructor.apply(this, arguments);
                        angular.extend(this, resource); 
                angular.extend(model, modelProps, resource);
                model.prototype = angular.extend({
                    model: modelProps
                }, resource.prototype);
                this[name] = model;
                model = function Model (opts) {
                    this.$proxy = mongoose.Document(opts, this.model.schema);
                    this.$proxy.init(this, opts);
                    angular.forEach(this.model.schema.methods, function (method, name) {
                        this[name] = method.bind(this.$proxy);
                    }, this);
                    angular.forEach(this.model.schema.paths, function (path, pathName) {
                        Object.defineProperty(this, pathName, {
                            enumerable: true,
                            set: function (value) {
                                this.$proxy[pathName] = value;
                            },
                            get: function () {
                                return this.$proxy[pathName];
                            }
                        });
                    }, this);
                    this.validate = function (cb, opts) {
                        opts = opts || {};
                        angular.forEach(this.model.schema.paths, function (path, name) {
                            this.$proxy[name] = opts[name] || this[name];
                        }, this);
                        this.$proxy.validate(cb);
                        //this[pathName] = path.options.default; 
                    }
                },
                */
            }, models);
            return models;
        };
    });
    angular.forEach(schemas, function ( schema, name ) {
        ngModule.factory(name, function (models) {
            return schema;
        });
    });
})();
