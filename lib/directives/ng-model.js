module.exports = function ngModel($timeout, $compile, $templateRequest, $animate, models){
    return {
        restrict: 'E',
        require: ['?^form', 'ngModel', '?^ngModelSet', '?^screens'],
        link: function(scope, element, attrs, ctrls){
            var name = attrs.ngModel,
                ngForm = ctrls[0],
                ngModel = ctrls[1],
                ngModelSet = ctrls[2],
                screens = ctrls[3];
            if(!ngForm){
                return;
            }
            var path = ngForm.getPath(name),
                template = attrs.template||path.options.template;
            if(template){
                var cScope = scope.$new(true);
                ngForm.registerField(name, ngModel);
                scope.$watch(name, function(value){
                    if(ngModel.$valid&&!ngModel.$isEmpty(value)){
                        ngForm.setValue(name, value);
                        if(ngModelSet&&ngModelSet.autoHide){
                            $timeout(function(){
                                var next = ngModelSet.getNext(name);
                                if(next){
                                    if(!ngForm.fields[next.path].visible){
                                        next = ngModelSet.getNext(next.path);
                                    }
                                    if(next&&ngForm.fields[next.path].visible){
                                        ngModelSet.show(next);
                                    }
                                }
                            }, 0, false);
                        }
                    }
                    else if(ngModelSet&&ngModelSet.autoHide){
                        ngModelSet.hideNext(name);
                        ngModel.activate();
                    }
                    if(screens){
                        $timeout(function(){
                            screens.load(element);
                        }, 200);
                    }
                    ngForm.updateParent();
                });
                var val = ngForm.getValue(name);
                scope[name] = val; 
                cScope['form'] = ngForm;
                cScope['field'] = ngModel; 
                cScope['display'] = ngForm.fields[name].display;
                cScope.$watch('form.fields.' + name + '.display', function(val){
                    cScope['display'] = val;
                });
                $templateRequest(template).then(function(template) { $compile(template)(cScope, function(clone, cScope){
                    clone.on('$destroy', function(){
                        cScope.$destroy();
                    });
                    $animate.enter(clone, element);
                }, {transcludeControllers: {
                    form: {instance: ngForm},
                    ngModel: {instance: ngModel},
                    screens: {instance: screens}
                   }}
                )});
                if(ngModelSet){
                    cScope.$watch('form.fields.' + name + '.visible', function(val, pVal){
                        if(val!=pVal){
                            if(!val){
                                ngModelSet.showNext(name);
                                ngModelSet.hide(name);
                            } else {
                                ngModelSet.show(name);
                            }
                        }
                    });
                }
            }
        }
    };
};
