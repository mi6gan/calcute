module.exports = function ngForm($compile, $timeout, models){
    class Field {
        constructor(ctrl, name){
            this.name = name;
            this.display = '';
            this.listeners = {
                change: [],
                activate: [],
                deactivate: []
            };
        }
        initCtrl(ctrl, form, name){
            ctrl.$name = name;
            ctrl.path = form.getPath(name);
            ctrl.setOther = angular.bind(ctrl, function setOther(set){
                form[this.$name + 'Other'] = set;
            });
            ctrl.$viewChangeListeners.push(angular.bind(ctrl, function(){
                var value = this.$viewValue || this.$modelValue;
                if(this.$valid){
                    this.setOther(false);
                    form.setValue(this.$name, value);
                    form.updateDisplay(this.$name);
                }
                else {
                    form.trigger(this.$name, 'change', value);
                    form.clearDisplay(this.$name);
                }
                form.updateParent();
            }));
            ctrl.activate = angular.bind(ctrl, function(){
                this.$setUntouched();
                form.trigger(this.$name, 'activate');
            });
            ctrl.deactivate = angular.bind(ctrl, function(){
                this.$setTouched();
                form.trigger(this.$name, 'deactivate');
            });
            if(ctrl.path.options.ref) {
                ctrl.ref = models[ctrl.path.options.ref];
                ctrl.initRef = angular.bind(ctrl, function(opts) {
                    this.value = new this.ref(opts);
                });
                ctrl.setRef = function (value) {
                    if(angular.isObject(value)) {
                        value.$submitted = true;
                    }
                    this.$setViewValue(value);
                }
            }
            else if(pathUtil.isMultiRef(ctrl.path)){
                ctrl.ref = models[ctrl.path.options.type[0].ref];
                ctrl.setCount = angular.bind(ctrl, function fieldSetCount(count) {
                    var value = this.$viewValue || [],
                    count = parseInt(count);
                    if(this.$viewValue&&count==value.length){
                        return;
                    }
                    value = value.slice(0, count);
                    for(var i=0; i < count; i++) {
                        if(value.length <= i) {
                            value.push(new this.ref());
                        }
                    }
                    this.$setViewValue(value.slice(0, count));
                    this.$validate();
                });
                var isEmpty = ctrl.$isEmpty;
                ctrl.$isEmpty = function(value){
                    return isEmpty(value)||(!angular.isArray(value));
                }
            }
            else if(angular.isArray(ctrl.path.options.type)){
                ctrl.addOrRemove = angular.bind(ctrl, function(value){
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
            angular.forEach(ctrl.path.validators, function(opts) {
                this.$validators[opts.type] = angular.bind(opts, function(modelValue, viewValue) {
                    var value = viewValue || modelValue,
                        valid = this.validator.call(form.getInstance(), value);
                    return Boolean(valid);
                });
            }, ctrl);
            ctrl.$setViewValue(form.getValue(name));
            ctrl.$validate();
        }
        on(eName, fn){
            assert(eName in this.listeners);
            this.listeners[eName].push(fn);
        }
        trigger(eName, args){
            assert(eName in this.listeners);
            angular.forEach(this.listeners[eName], function(fn){
                fn.apply(fn, args);
            }, this);
        }
    }
    return {
        restrict: 'AE',
        require: ['form', '?^ngModel'],
        link: function(scope, element, attrs, ctrls){
            var modelName = attrs.model,
                ngForm = ctrls[0],
                pNgModel = ctrls[1],
                model = modelName ? models[modelName] : null,
                iName = attrs.instance||'formInstance',
                iScope = scope;
            if(model){
                ngForm.fields = {};
                if(pNgModel){
                    ngForm.pNgModel = pNgModel;
                }
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
                ngForm.registerField = angular.bind(ngForm, function(path, controller){
                    assert(path in model.prototype.schema.paths);
                    if(!(path in this.fields)){
                        this.fields[path] = new Field(path);
                    }
                    this.fields[path].initCtrl(controller, ngForm, path);
                    return controller;
                });
                ngForm.getPath = function(path){
                    assert(path in model.prototype.schema.paths);
                    return model.prototype.schema.paths[path];
                }
                ngForm.getInstance = angular.bind(ngForm, function(path){
                    return iScope[iName];
                });
                ngForm.getValue = angular.bind(ngForm, function(path){
                    assert(path in model.prototype.schema.paths);
                    return iScope[iName][path];
                });
                ngForm.setValue = angular.bind(ngForm, function(path, value){
                    assert(path in model.prototype.schema.paths);
                    iScope[iName][path] = value;
                    this.trigger(path, 'change', [value]);
                });
                ngForm.updateDisplay = angular.bind(ngForm, function(path){
                    assert(path in this.fields);
                    var instance = iScope[iName];
                    if(instance&&angular.isFunction(instance.display)){
                        this.fields[path].display = instance.display(path, instance[path]);
                    }
                });
                ngForm.clearDisplay = angular.bind(ngForm, function(path){
                    assert(path in this.fields);
                    this.fields[path].display = '';
                });
                ngForm.on = angular.bind(ngForm, function(path, eName, fn){
                    assert(path in this.fields);
                    this.fields[path].on(eName, fn);
                });
                ngForm.trigger = angular.bind(ngForm, function(path, eName){
                    assert(path in this.fields);
                    var args = [];
                    for(var i=2; i<arguments.length; i++){
                        args.push(arguments[i]);
                    }
                    this.fields[path].trigger(eName, args);
                });
                ngForm.save = angular.bind(ngForm, function(){
                    iScope[iName].$save().then(function(){
                        ngForm.$commited = true;
                    });
                });
                ngForm.updateParent = angular.bind(ngForm, function(){
                    if(this.pNgModel){
                        this.pNgModel.$validate();
                    }
                });
                ngForm.$ready = true;
            }
        }
    };
};

var settings = require('settings');
var assert = settings.DEBUG ? require('assert') : ()=>{},
    pathUtil = require('../utils/schema-path.js');
