/*
module.exports = function ngModel($q, $compile, $timeout) {
    return {
        restrict: 'A',
        require: ['ngModel', '?^modelField'],
        scope: {
            addValue: '<',
            inputAttrs: '<',
            inputType: '@',
            onChange: '&',
            setOn: '@',
            setValue: '&'
        },
        link: function(scope, element, attrs, ctrls) {
            var ngModel = ctrls[0],
                field = ctrls[1];
            if( field == null) {
                return;
            }
            if( element[0].tagName.toLowerCase() == 'input' ) {
                if(scope.inputType) {
                    attrs.$set('type', scope.inputType);
                }
                if(attrs.type == 'text') {
                    if(!field.prev || ngModel.$pristine) {
                        element[0].focus();
                    }
                    if(angular.isObject(scope.inputAttrs)) {
                        angular.forEach( scope.inputAttrs, function (value, name) {
                            if(typeof(name)=='string') {
                                this.$set(name, value);
                            }
                        }, attrs );
                    }
                }
                element.on('keyup', function (e) {
                    if(e.keyCode==13) {
                        if(ngModel.$valid) {
                            field.enterKeyPressed(element);
                        }
                    }
                });
            }
            field.onActivate(function () {
                $timeout(function () {
                    element[0].focus();
                }, 100);
            });
            field.setValidators(ngModel);
            element.on('focus', function() {
                field.setActive(true, true);
            });
            element.on('blur', function() {
                field.setActive(false, true);
            });
            if( scope.setOn && (scope.setValue || scope.addValue ) ) {
                var setScope = scope.$new();
                element.on(scope.setOn, function($event) {
                    setScope.$event = $event;
                    var value = scope.addValue || scope.setValue(setScope);
                    if ( scope.addValue ) {
                        var cValue = ngModel.$viewValue;
                        if( !angular.isArray(cValue) ) {
                            if ( angular.isDefined(value) && value != 'not-supported' ) {
                                value = [value];
                            }
                            else {
                                value = undefined;
                            }
                        }
                        else {
                            var nValue = [];
                            angular.forEach( cValue, function ( v, i ) {
                                if ( angular.isObject( v ) ? ( v.id != value.id ) : ( v != value ) ){
                                    this.push( v );
                                }
                            }.bind( nValue ) );
                            if( cValue.indexOf( value ) == -1 ) {
                                nValue.push( value );
                            }
                            value = nValue;
                            if( value.length == 0 ) {
                                value = undefined;
                            }
                        }
                    }
                    ngModel.$setViewValue( value );
                });
            }
            if( scope.onChange ) {
                element.on( 'change', function ($event) {
                    scope.$eval(scope.onChange);
                } );
            }
            ngModel.$viewChangeListeners.push(function () {
                field.updateErrors(ngModel.$error, ngModel.$valid, !angular.isDefined(ngModel.$viewValue));
            });
        }
    };
}*/
