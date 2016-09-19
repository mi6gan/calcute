module.exports = function input($timeout, $interpolate){
    return {
        restrict: 'E',
        require: ['?^form', '?^ngModelSet', '?^ngModel'],
        link: function(scope, element, attrs, ctrls){
            var inputAttrs = scope.$eval(attrs.inputAttrs),
                form = ctrls[0],
                ngModelSet = ctrls[1],
                ngModel = ctrls[2],
                valid = false,
                maskerPatterns = {
                    "9": /\d/,
                    "w": /[\w\W]/,
                    "N": /[A-za-zА-Яа-я]{1,20}/,
                    "n": /[A-za-zА-Яа-я]{0,20}/,
                    "C": /\d{1,4}/,
                    "R": /\d{1,9}/,
                    "L": /\d{1,20}/,
                    "S": /[A-za-zА-Яа-я\s]{1,20}/,
                    "D": /\d{1,2}/,
                    "M": /\d{1,2}/,
                    "Y": /\d{1,4}/,
                    "d": /\d{1,1}/,
                    "t": /[A-za-zА-Яа-я0-9\s]{1,200}/
                };
            if(!ngModel){
                return;
            }
            angular.forEach(inputAttrs, function(value, name){
                attrs.$set(name, value);
            });
            var patterns = $interpolate(attrs.mask)(scope),
                patterns = angular.isDefined(patterns) ? patterns.toString().split("") : '',
                placeholder = attrs.includePlaceholder ? ( attrs.placeholder || '' ) : '';
            element[0].value = ngModel.$viewValue||'';
            ngModel.activate = function(){
                $timeout(function () {
                    element[0].focus();
                }, 100);
            };
            ngModel.deactivate = function(){
                element[0].blur();
            };
            element.on('input', function (e) {
                var value = ngModel.$isEmpty(this.value) ? '' : this.value,
                    maskedValue = '',
                    i = 0;
                if(value.length < placeholder.length) {
                    value = placeholder;
                }
                for( i; i < patterns.length; ++i ) {
                    var pattern = patterns[i],
                        regexPattern = maskerPatterns[pattern];
                    if( angular.isObject(regexPattern) && ( regexPattern instanceof RegExp ) ) {
                        var match = value.match(regexPattern);
                        if( !match || match.index > 0 ) {
                            break;
                        }
                        maskedValue += match[0];
                        value = value.substring(match[0].length);
                    }
                    else if(value.length) {
                        if( value.substring(0, pattern.length) == pattern ) {
                            value = value.substring(pattern.length);
                        }
                        maskedValue += pattern;
                    }
                }
                valid = (i == patterns.length); 
                if(value != maskedValue) {
                    element[0].value = maskedValue;
                }
                ngModel.$setValidity('masker', valid);
                ngModel.$setViewValue(maskedValue);
            });
            element.on('keyup', function (e) {
                if(e.keyCode==13) {
                    ngModel.$setViewValue(this.value);
                    $timeout(function () {
                        if(ngModel.$valid) {
                            ngModel.deactivate();
                        }
                    }, 100);
                }
            });
            element.on('blur', function() {
                ngModel.$setViewValue(this.value);
            });
            form.pathChangeListeners.push(function(name, value){
                if(name==ngModel.$name&&ngModel.$valid){
                    element[0].value = value||'';
                    if(!value){
                        ngModel.activate();
                    }
                }
            });
            if(attrs.type == 'text') {
                if(ngModel.$pristine) {
                    ngModel.activate();
                }
            }
        }
    };
};
