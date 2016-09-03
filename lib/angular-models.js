(function () {
    'use strict';
    var mongoose = require('mongoose'),
        angular = require('angular'),
        settings = require('settings'),
        ngResource = require('angular-resource'),
        schemas = require('../models/remote.js').schemas,
        ngModule = angular.module('calcuteModels', ['ngResource']);
    ngModule.provider('models', function () {
        this.$get = function ($resource) {
            var models = {
                $urlPrefix: settings.SERVICE_URL.replace(/\/$/, '') + '/models'
            };
            models.$resource = angular.bind(this, $resource, models.$urlPrefix + '/:name/:id');
            angular.forEach(schemas, function ( schema, name ) {
                var modelProps = {
                        schema: schema,
                        modelName: name
                    },
                    actions = {};
                angular.forEach(['queryPub', 'queryPubTop'], function (method) {
                    actions[method] = {
                        method: 'GET', 
                        isArray: true,
                        url: this.$urlPrefix + '/:name/action/:method',
                        params: {method: method}
                    };
                }, this);
                var resource = this.$resource({name: name.toLowerCase(), id: '@_id'}, actions);
                this[name] = function Model (opts) {
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
                        this[pathName] = path.options.default; 
                    }, this);
                };
                angular.extend(this[name], modelProps, mongoose.Document, resource);
                this[name].prototype = angular.extend({
                    model: modelProps,
                    validate: function (cb, opts) {
                        opts = opts || {};
                        angular.forEach(this.model.schema.paths, function (path, name) {
                            this.$proxy[name] = opts[name] || this[name];
                        }, this);
                        this.$proxy.validate(cb);
                    }
                }, mongoose.Document.prototype, resource.prototype);
            }, models);
            return models;
        };
    });
    angular.forEach(schemas, function ( schema, name ) {
        this.factory(name, function (models) {
            return models[name];
        });
    }, ngModule);
})();
