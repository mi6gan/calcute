module.exports = function ngForm($compile, models){
    return {
        restrict: 'AE',
        require: 'form',
        link: function(scope, element, attrs, ngForm){
            var modelName = attrs.model,
                model = modelName ? models[modelName] : null,
                instanceName = attrs.instance||'formInstance',
                instanceNameParts = attrs.instance.split('.');
            if(model){
                if(!(scope[instanceName] instanceof model)){
                    scope[instanceName] = new model();
                }
                ngForm.getPath = function(path){
                    assert.ok(path in model.prototype.schema.paths);
                    return model.prototype.schema.paths[path];
                }
                ngForm.getValue = angular.bind(ngForm, function(path){
                    return scope[instanceName][path];
                });
                ngForm.getDisplay = angular.bind(ngForm, function(path, value){
                    return ((scope[instanceName]&&angular.isFunction(scope[instanceName].display)) ? scope[instanceName].display(path, value) : undefined);
                });
                ngForm.setValue = angular.bind(ngForm, function(path, value){
                    assert.ok(path in model.prototype.schema.paths);
                    scope[instanceName][path] = value;
                    var instance = scope;
                    angular.forEach(instanceNameParts, function(name, i, array){
                        if(i==(array.length-1)){
                            instance[name] = scope[instanceName];
                        }
                        else {
                            if(!angular.isObject(instance[name])){
                                instance[name] = {};
                            }
                            instance = instance[name];
                        }
                    });
                });
                ngForm.$$ready = true;
            }
        }
    };
};
var assert = require('assert');
