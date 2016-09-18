module.exports = function ngModel($compile, $templateRequest, $animate, models){
    return {
        restrict: 'E',
        require: ['?^form', 'ngModel', '?^ngModelSet'],
        link: function(scope, element, attrs, ctrls){
            var name = attrs.ngModel,
                ngForm = ctrls[0],
                ngModel = ctrls[1],
                ngModelSet = ctrls[2];
            if(!ngForm){
                return;
            }
            ngModel.$viewChangeListeners.push(angular.bind(ngModel, function(){
                this.setOther(false);
                ngModel.displayValue = ngForm.getDisplay(name, this.$viewValue);
                ngForm.setValue(name, this.$viewValue);
                if(ngModelSet&&this.$valid){
                    ngModelSet.showNext(name); 
                }
            }));
            scope.$watch(ngForm.$name + '.$$ready', function(ready){
                if(ready){
                  var path = ngForm.getPath(name),
                      template = attrs.template||path.options.template;
                  if(template){
                    $templateRequest(template).then(function(template) {
                        $compile(template)(scope.$new(), function(clone, scope){
                            angular.bind(ngModel, initField)(models, ngForm, name);
                            scope['field'] = ngModel;
                            scope['form'] = ngForm;
                            $animate.enter(clone, element);
                        }, {
                            transcludeControllers: {
                                form: {instance: ngForm},
                                ngModel: {instance: ngModel}
                            }
                        });
                    });
                  };
                }
            });
        }
    };
};

function initField(models, form, name){
    this.path = form.getPath(name);
    this.display = angular.bind(this, function(value){
        form.getDisplay(name, value);
    });
    this.setOther = angular.bind(this, function setOther(set){
        form[name + 'Other'] = set;
    });
    this.$setViewValue(form.getValue(name));
    this.isMultiRef = angular.bind(this, function isMultiRef() {
        return angular.isArray(this.path.options.type) && this.path.options.type.length && this.path.options.type[0].ref;
    });
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
    else if(this.isMultiRef()) {
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
            /*
            angular.forEach(this.$viewValue, function(e, i) {
                e.validate(angular.bind(this, function(error) {
                    if(error) {
                    }
                }));
            }, this);*/
        });
    }
};
