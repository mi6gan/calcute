module.exports = function input($timeout, $interpolate){
    return {
        restrict: 'E',
        require: ['?^form', '?^ngModelSet', '?^ngModel'],
        link: function(scope, element, attrs, ctrls){
            var form = ctrls[0],
                ngModelSet = ctrls[1],
                ngModel = ctrls[2];
            if(!ngModel){return;}
            initInputAttrs(scope, element, attrs, ctrls);
            initMask(scope, element, attrs, ctrls);
            var autoFocus = attrs.autoFocus,
                placeholder = attrs.includePlaceholder ? ( attrs.placeholder || '' ) : '',
                emptyName = attrs.setOnEmpty;
            if(emptyName){
                scope[emptyName] = true;
            }
            form.on(ngModel.$name, 'activate', function(){
                $timeout(function () {
                    element[0].focus();
                }, 500);
            }, scope);
            form.on(ngModel.$name, 'deactivate', function(){
                ngModel.$setViewValue(element[0].value);
                ngModel.$validate();
                element[0].blur();
            }, scope);
            element.on('keyup', function (e) {
                if(emptyName){
                    scope[emptyName] = !(this.value&&this.value.length);
                    scope.$digest();
                }
                if(e.keyCode==13) {
                    ngModel.$setViewValue(this.value);
                    ngModel.$validate();
                    if(ngModel.$valid) {
                        ngModel.deactivate();
                    }
                }
            });
            element.on('blur', function() {
                if(ngModel.$untouched){
                    ngModel.deactivate();
                }
            });
            if(ngModel.$viewValue){
                form.trigger(ngModel.$name, 'change', [ngModel.$viewValue]);
            }
            if(autoFocus){ngModel.activate();}
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
            "C": /\d{1,5}/,
            "Z": /\d{1,6}/,
            "R": /\d{1,9}/,
            "L": /\d{1,20}/,
            "S": /[A-za-zА-Яа-я\s]{1,20}/,
            "D": /\d{1,2}/,
            "M": /\d{1,2}/,
            "Y": /\d{1,4}/,
            "d": /\d{1,1}/,
            "t": /[A-za-zА-Яа-я0-9\s]{1,200}/,
            "u": /[A-za-zА-Яа-я0-9\s\.]{1,200}/
        },
        valid = true,
        form = ctrls[0],
        ngModel = ctrls[2];
    if(!patterns||!patterns.length){
        return;
    }
    form.on(ngModel.$name, 'change', function(value){
        if(value != element[0].value) {
            value = angular.bind(element[0], getMaskedValue)(value);
            element[0].value = value;
        }
    }, scope);
    element.on('input', function () {
        var value = angular.bind(this, getMaskedValue)();
        if(value != this.value) {
            this.value = value;
        }
    });
    ngModel.$validators.masker = function(){
        return valid;
    };
    function getMaskedValue(value){
        var value = String(value||this.value||'');
        if(!patterns||!patterns.length){
            valid = true;
            return value;
        }
        var maskedValue = '',
            suffix = '',
            mPatterns = patterns.map((p)=>(maskerPatterns[p]||p)),
            i = 0;
        if(value&&placeholder&&value.length<placeholder.length){
            value = placeholder.substring(value.length-1) + value;
        }
        for(i; i<mPatterns.length; ++i){
            if(mPatterns[i] instanceof RegExp){
                var match = value.match(mPatterns[i]);
                if(match&&match.index==0){
                    if(match[0].length){
                        maskedValue += (suffix+match[0]);
                        value = value.substring(match[0].length);
                        suffix = '';
                    }
                } else {break;}
            } else {
                if(value.substring(0,1)==mPatterns[i]){
                    value = value.substring(1);
                    maskedValue += (suffix+mPatterns[i]);
                    suffix = '';
                } else {suffix += mPatterns[i];}
            }
        }
        valid = (i==patterns.length);
        return maskedValue;
    }
}

function initInputAttrs(scope, element, attrs, ctrls){
    var inputAttrs = scope.$eval(attrs.inputAttrs);
    angular.forEach(inputAttrs, function(value, name){
        attrs.$set(name, value);
    });
}
};

