module.exports = function input($timeout, $interpolate){
    return {
        restrict: 'E',
        require: ['?^form', '?^ngModelSet', '?^ngModel'],
        link: function(scope, element, attrs, ctrls){
            var form = ctrls[0],
                ngModelSet = ctrls[1],
                ngModel = ctrls[2],
                autoFocus = scope.$eval(attrs.autoFocus),
                emptyName = attrs.setOnEmpty;
            if(emptyName){
                scope[emptyName] = true;
            }
            if(!ngModel){return;}
            if(autoFocus){element[0].focus();}
            element[0].value = ngModel.$viewValue||'';
            initInputAttrs(scope, element, attrs, ctrls);
            initMask(scope, element, attrs, ctrls);
            form.on(ngModel.$name, 'activate', function(){
                ngModel.$setUntouched();
                $timeout(function () {
                    element[0].focus();
                }, 500);
            }, scope);
            form.on(ngModel.$name, 'deactivate', function(){
                ngModel.$setTouched();
                element[0].blur();
            }, scope);
            element.on('keyup', function (e) {
                if(emptyName){
                    scope[emptyName] = !(this.value&&this.value.length);
                    scope.$digest();
                }
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
                ngModel.deactivate();
            });
            form.on(ngModel.$name, 'change', function(value){
                element[0].value = value||'';
                if(!value){
                    ngModel.activate();
                }
            }, scope);
        }
    };
function initMask(scope, element, attrs, ctrls){
    var patterns = $interpolate(attrs.mask)(scope),
        patterns = angular.isDefined(patterns) ? patterns.toString().split("") : '',
        placeholder = attrs.includePlaceholder ? ( attrs.placeholder || '' ) : '',
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
        },
        ngModel = ctrls[2];
    if(!patterns||!patterns.length){
        return;
    }
    element.on('input', function (e) {
        var value = ngModel.$isEmpty(this.value) ? '' : this.value,
            maskedValue = '',
            i = 0;
        if(value.length < placeholder.length) {
            value = placeholder;
        }
        for( i; i < patterns.length; ++i ) {
            var pattern = patterns[i],
                regexPattern = maskerPatterns[pattern],
                valid;
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
    });
}

function initInputAttrs(scope, element, attrs, ctrls){
    var inputAttrs = scope.$eval(attrs.inputAttrs);
    angular.forEach(inputAttrs, function(value, name){
        attrs.$set(name, value);
    });
}
};

