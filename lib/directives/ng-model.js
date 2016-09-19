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
            scope.$watch(ngForm.$name + '.$$ready', function(ready, __, scope){
                if(ready){
                  var path = ngForm.getPath(name),
                      template = attrs.template||path.options.template;
                  if(template){
                    $templateRequest(template).then(function(template) {
                        $compile(template)(scope.$new(), function(clone, scope){
                            scope['field'] = ngForm.registerField(name, ngModel);
                            scope['form'] = ngForm;
                            $animate.enter(clone, element);
                        }, {
                            transcludeControllers: {
                                form: {instance: ngForm},
                                ngModel: {instance: ngModel/*scope['field']*/}
                            }
                        });
                    });
                  };
                  ngForm.triggerChangeListeners(name, ngForm.getValue(name));
                }
                scope.$watch(ngForm.$name + '.$$ready');
            });
        }
    };
};
