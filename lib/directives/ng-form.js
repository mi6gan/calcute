module.exports = function ngForm($compile, models){
    return {
        restrict: 'AE',
        require: 'form',
        link: function(scope, element, attrs, ngForm){
            var modelName = attrs.model,
                model = modelName ? models[modelName] : null,
                iName = attrs.instance||'formInstance',
                iScope = scope;
            if(model){
                ngForm.pathChangeListeners = [];
                ngForm.display = {}; 
                angular.forEach(iName.split('.'), function(name, i, array){
                    if(i==(array.length-1)){
                        if(!iScope[name]||!(iScope[name] instanceof model)){
                            iScope[name] = new model(iScope[name]);
                        }
                        iName = name;
                    }
                    else {
                        if(!angular.isObject(iScope[name])){
                            iScope[name] = {};
                        }
                        iScope = iScope[name];
                    }
                });
                ngForm.triggerChangeListeners = angular.bind(ngForm, function(path, value){
                    angular.forEach(this.pathChangeListeners, function(fn){
                        fn(path, value);
                    }, this);
                });
                ngForm.registerField = angular.bind(ngForm, function(path, controller){
                    assert.ok(path in model.prototype.schema.paths);
                    angular.bind(controller, initField)(models, ngForm, path);
                    return controller;
                });
                ngForm.getPath = function(path){
                    assert.ok(path in model.prototype.schema.paths);
                    return model.prototype.schema.paths[path];
                }
                ngForm.getValue = angular.bind(ngForm, function(path){
                    return iScope[iName][path];
                });
                ngForm.setValue = angular.bind(ngForm, function(path, value){
                    assert.ok(path in model.prototype.schema.paths);
                    iScope[iName][path] = value;
                    ngForm.triggerChangeListeners(path, value);
                });
                ngForm.updateDisplay = angular.bind(ngForm, function(path){
                    assert.ok(path in model.prototype.schema.paths);
                    var instance = iScope[iName];
                    if(instance&&angular.isFunction(instance.display)){
                        this.display[path] = instance.display(path, instance[path]);
                    }
                });
                ngForm.clearDisplay = angular.bind(ngForm, function(path){
                    assert.ok(path in model.prototype.schema.paths);
                    delete this.display[path];
                });
                ngForm.save = angular.bind(ngForm, function(){
                    iScope[iName].$save().then(function(){
                        ngForm.$commited = true;
                    });
                });
                ngForm.$$ready = true;
            }
        }
    };
};


var assert = require('assert'),
    pathUtil = require('../utils/schema-path.js');
function initField(models, form, name){
    this.$name = name;
    this.path = form.getPath(name);
    this.setOther = angular.bind(this, function setOther(set){
        form[name + 'Other'] = set;
    });
    this.$viewChangeListeners.push(angular.bind(this, function(){
        if(this.$valid){
            this.setOther(false);
            var value = this.$viewValue || this.$modelValue;
            form.setValue(this.$name, value);
            form.updateDisplay(name);
        }
        else {
            form.triggerChangeListeners(this.$name);
        }
    }));
    this.$setViewValue(form.getValue(name));
    if(this.path.options.ref) {
        this.ref = models[this.path.options.ref];
        this.initRef = angular.bind(this, function(opts) {
            this.value = new this.ref(opts);
        });
        this.setRef = function (value) {
            if(angular.isObject(value)) {
                value.$submitted = true;
            }
            this.$setViewValue(value);
        }
    }
    else if(pathUtil.isMultiRef(this.path)){
        this.ref = models[this.path.options.type[0].ref];
        this.setCount = angular.bind(this, function fieldSetCount(count) {
            var value = this.$viewValue || [],
            count = parseInt(count);
            for(var i=0; i < count; i++) {
                if(value.length <= i) {
                    value.push(new this.ref());
                }
            }
            this.$setViewValue(value.slice(0, count));
        });
    }
    else if(angular.isArray(this.path.options.type)){
        this.addOrRemove = angular.bind(this, function(value){
            var values = this.$viewValue||[],
                index = values.indexOf(value);
            if(index>-1){
                values.splice(index, 1);
            }
            else {
                values.push(value);
            }
            var newValues = [];
            angular.forEach(values, function(v){
                newValues.push(v);
            });
            this.$setViewValue(newValues);
        });
    }
    angular.forEach(this.path.validators, function(opts) {
        this.$validators[opts.type] = function(modelValue, viewValue) {
            var value = modelValue || viewValue,
                valid = opts.validator(value);
            return Boolean(valid);
        };
    }, this);
};
