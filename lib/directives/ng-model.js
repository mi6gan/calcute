module.exports = function ngModel($timeout, $compile, $templateRequest, $animate, models){
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
            var path = ngForm.getPath(name),
                $scope = scope,
                template = attrs.template||path.options.template;
            if(template){
                $templateRequest(template).then(function(template) { $compile(template)(scope.$new(), function(clone, scope){
                    var displayName = ngForm.$name + '.fields.' + name + '.display';
                    ngForm.registerField(name, ngModel);
                    $scope.$watch(name, function(value){
                        if(ngModel.$valid&&!ngModel.$isEmpty(value)){
                            ngForm.setValue(name, value);
                            if(ngModelSet&&ngModelSet.autoHide){
                                ngModelSet.showNext(name);
                            }
                        }
                        else {
                            ngForm.clearDisplay(name);
                            if(ngModelSet&&ngModelSet.autoHide){
                                ngModelSet.hideNext(name);
                                ngModel.activate();
                            }
                        }
                        ngForm.updateParent();
                    });
                    var val = ngForm.getValue(name);
                    if(val!=$scope[name]){
                        $scope[name] = val; 
                    }
                    scope['field'] = ngModel; 
                    scope['form'] = ngForm;
                    scope['display'] = scope[displayName];
                    scope.$watch(displayName, function(display){
                        scope['display'] = display;
                    });
                    $animate.enter(clone, element);
                }, {transcludeControllers: {
                    form: {instance: ngForm},
                    ngModel: {instance: ngModel}
                   }}
                )});
            }
        }
    };
};
