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
            models.$resource = angular.bind(this, $resource, models.$urlPrefix + '/:name/:id')
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
                    mongoose.Document.call(this, opts, this.model.schema);
                    angular.forEach(this.model.schema.methods, function (method, name) {
                        this[name] = method.bind(this);
                    }, this);
                };
                angular.extend(this[name], modelProps, mongoose.Document, resource);
                this[name].prototype = angular.extend({
                    model: modelProps
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
