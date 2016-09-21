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
            scope.$watch(ngForm.$name + '.$ready', function(ready){
            if(ready){
            var path = ngForm.getPath(name),
                template = attrs.template||path.options.template;
            if(template){
                $templateRequest(template).then(function(template) {
                    $compile(template)(scope.$new(), function(clone, scope){
                        scope['field'] = ngForm.registerField(name, ngModel);
                        scope['form'] = ngForm;
                        scope.$watch(ngForm.$name + '.fields.' + name + '.display', function(display){
                            scope['display'] = display;
                        });
                        $animate.enter(clone, element).then(function(){
                            if(!ngModel.$isEmpty(ngModel.$viewValue)){
                                $timeout(function(){
                                    ngForm.trigger(name, 'change', [ngModel.$viewValue]);
                                }, 50);
                            }
                        });
                    }, {
                        transcludeControllers: {
                            form: {instance: ngForm},
                            ngModel: {instance: ngModel}
                        }
                    });
                });
            }
            }
            });
        }
    };
};
