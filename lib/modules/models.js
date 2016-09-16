'use strict';
module.exports = function initNgModule(ngModule){
    var mongoose = require('mongoose'),
        angular = require('angular'),
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
                    angular.forEach(schema.paths, function(path, name){
                        Object.defineProperty(this, name, {
                            get: function(){
                                return this.$$doc[name];
                            },
                            set: function(value){
                                this.$$doc[name] = value;
                            }
                        });
                    }, this);
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

    ngModule.directive('ngForm', function ($compile, models){
        return {
            restrict: 'AE',
            require: 'form',
            link: function(scope, element, attrs, ngForm){
                var modelName = attrs.model;
                if(modelName){
                    ngForm.model = models[modelName];
                    if(ngForm.model){
                        ngForm.instance = new ngForm.model();
                    }
                }
            }
        };
    });
    var initField = function initField(models, instance, path){
        this.path = path;
        this.isMultiRef = angular.bind(this, function isMultiRef() {
            return angular.isArray(this.path.options.type) && this.path.options.type.length && this.path.options.type[0].ref;
        });
        if(this.path.options.ref) {
            this.ref = models[this.path.options.ref];
            this.initRef = angular.bind(this, function(opts) {
                this.value = new this.ref(opts);
                this.setValidity(false);
            });
            this.setRef = function (value) {
                if(angular.isObject(value)) {
                    value.$submitted = true;
                }
                this.$setViewValue(value);
            }
        }
        else if(this.isMultiRef()) {
            this.ref = models[this.path.options.type[0].ref];
            this.setCount = angular.bind(this, function fieldSetCount(count) {
                var value = this.$viewValue || [],
                count = parseInt(count);
                this.setValidity(true);
                for(var i=0; i < count; i++) {
                    if(value.length <= i) {
                        value.push(new this.ref());
                        instance.setValidity(path.options.path, false);
                    }
                }
                this.$viewValue = value.slice(0, count);
                angular.forEach(this.$viewValue, function(e, i) {
                    e.validate(angular.bind(this, function(error) {
                        if(error) {
                            instance.setValidity(path.options.path, false);
                        }
                    }));
                }, this);
            });
        }
    };
    ngModule.directive('ngModel', function ($compile, $templateRequest, $animate, models){
        return {
            restrict: 'E',
            require: ['?^^form', 'ngModel'],
            link: function(scope, element, attrs, ctrls){
                var name = attrs.ngModel.split(".").slice(-1)[0],
                    ngForm = ctrls[0],
                    ngModel = ctrls[1];
                if(!ngForm){
                    return;
                }
                ngModel.$viewChangeListeners.push(function(){
                    if(ngForm.instance){
                        ngForm.instance[name] = ngModel.$modelValue;
                    }
                });
                scope.$watch(ngForm.$name+'.instance', function(instance, oldInstance){
                    if(instance){
                      var path = instance.schema.paths[name];
                      if(path.options.template){
                        $templateRequest(path.options.template).then(function (template) {
                            $compile(template)(scope.$new(), function(clone, scope){
                                angular.bind(ngModel, initField)(models, instance, path);
                                scope['field'] = ngModel;
                                $animate.enter(clone, element);
                            });
                        });
                      };
                    }
                });
            }
        };
    });
}
