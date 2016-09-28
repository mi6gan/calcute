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
                var transformRequest = [function(data, headersGetter){
                    return JSON.stringify(data.clean());
                }];
                var transformResponse = [function(data, headersGetter){
                }]
                var actions = {
                    'save': {method:'POST', transformRequest: transformRequest}
                };
                angular.forEach(['queryPub', 'queryPubTop'], function (method) {
                    actions[method] = {
                        method: 'GET', 
                        isArray: true,
                        url: this.$urlPrefix + '/:name/action/:method',
                        params: {method: method}
                    };
                }, this);
                this[name] = class extends $resource(models.$urlPrefix + '/:name/:id', {name: name.toLowerCase(), id: '@_id'}, actions) {
                    constructor(opts, isNew){
                        super(opts);
                        this.$$doc = new mongoose.Document(opts, this.schema); 
                        this.$$doc.isNew = !Boolean('_id' in (opts||{}));
                        angular.forEach(schema.methods, function(fn, name){
                            this[name] = angular.bind(this, fn);
                        }, this);
                    }
                    validateSync(){
                        var obj = this,
                            valid = true;
                        angular.forEach(schema.paths, function(path, name){
                            angular.forEach(path.validators, function(v){
                                valid = valid&&v.validator.call(obj, obj[name]);
                            });
                        });
                        return valid;
                    }
                    clean(){
                        var obj = {},
                            data = this;
                        if(!this.$$doc){
                            this.$$doc = new mongoose.Document({}, this.schema); 
                        }
                        angular.forEach(data.schema.paths, function(path, name){
                            if(name=='_id'&&data.$$doc.isNew){return;}
                            if(pathUtil.isMultiRef(path)){
                                obj[name] = [];
                                angular.forEach(data[name], function(item){
                                    obj[name].push(item.clean());
                                });
                            }
                            else if(pathUtil.isRef(path)){
                                obj[name] = data[name].clean();
                            }
                            else {
                                data.$$doc[name] = data[name];
                                obj[name] = data.$$doc[name];
                            }
                        });
                        return obj;
                    }
                }
                this[name].prototype.schema = schema;
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
