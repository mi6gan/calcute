module.exports = function input($timeout){
    return {
        restrict: 'E',
        require: ['?^form', '?^ngModelSet', '?^ngModel'],
        link: function(scope, element, attrs, ctrls){
            var inputAttrs = scope.$eval(attrs.inputAttrs),
                ngForm = ctrls[0],
                ngModelSet = ctrls[1],
                ngModel = ctrls[2];
            angular.forEach(inputAttrs, function(value, name){
                attrs.$set(name, value);
            });
            if(ngModel){
                ngModel.activate = function(){
                    ngModel.$active = true;
                    $timeout(function () {
                        element[0].focus();
                    }, 100);
                };
                element.on('keyup', function (e) {
                    if(e.keyCode==13) {
                        ngModel.$setViewValue(scope.value);
                        $timeout(function () {
                            if(ngModel.$valid) {
                                element[0].blur();
                            }
                        }, 100);
                    }
                });
                element.on('focus', function() {
                    ngModel.$active = true;
                });
                element.on('blur', function() {
                    ngModel.$active = false;
                });
                if(attrs.type == 'text') {
                    if(ngModel.$pristine) {
                        element[0].focus();
                    }
                }
            }
        }
    };
};
