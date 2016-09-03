(function () {
'use strict';
angular.module('Calcute', ['ngMessages', 'ngRoute', 'ngAnimate', 'masker', 'calcuteModels'])
    .config(function(MaskerProvider) {
        angular.extend(MaskerProvider.patterns, {
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
        });
    })
    .directive('array', function($animate, $compile, $q, $timeout) {
        return {
            restrict: 'A',
            terminal: true,
            bindToController: {
                'array': '<',
                'arrayArgs': '<',
                'arrayName': '@'
            },
            scope: true,
            controllerAs: 'array',
            controller: function ($scope, $element, $attrs) {
                $element.addClass('hide');
                if(!this.arrayName) {
                    this.arrayName = 'choices';
                }
                this.$onInit = function () {
                    this.$itemElements = {};
                    this.items = {};
                    this.linkQ = function ( scope, template, pQ, aQ, enter) {
                        return $q( function ( resolve ) {
                            ( ( pQ && pQ.then ) ? pQ : $q( function (r) { r(pQ); } ) ).then( angular.bind( this, function ( resolve, scope, pElement ) {
                                ( ( aQ && aQ.then ) ? aQ : $q( function (r) { r(aQ); } ) ).then( angular.bind( this, function ( resolve, scope, pElement, aElement ) {
                                    $compile( template )( scope, angular.bind( this, function ( resolve, pElement, aElement, clone, scope ) {
                                            if(enter) {
                                                $animate.enter( clone, pElement, aElement ).then( angular.bind( this, function ( resolve, clone) {
                                                    resolve( clone );
                                                }, resolve, clone ) );
                                            }
                                            else {
                                                if(aElement) {
                                                    aElement.after(clone);
                                                }
                                                else  {
                                                    pElement.append(clone);
                                                }
                                                resolve( clone );
                                            }
                                    }, resolve, pElement, aElement ) );
                                }, resolve, scope, pElement ) );
                            }, resolve, scope ) );
                        } );
                    };
                    if(angular.isFunction(this.array)) {
                        var arrayName = this.arrayName;
                        this.array(this.arrayArgs).$promise.then( angular.bind($scope, function ( result ) {
                            this[arrayName] = result;
                        }));
                    }
                    else {
                        $scope[this.arrayName] = this.array;
                    }
                };
                $scope.$watchCollection(this.arrayName, angular.bind( this, function ( cChoices, pChoices, scope ) {
                    if( !angular.isArray(cChoices) || !cChoices.length ) {
                        return;
                    }
                    angular.forEach( cChoices, function (choice, index, choices) {
                        var item = this.items[index],
                            after = (index > 0) ? this.$itemElements[index - 1] : undefined;
                            if(!angular.isObject(item)) {
                                item = scope.$new();
                            }
                            item.item = choice;
                            item.$index = index;
                            item.last = (index == (choices.length-1));
                            this.$itemElements[index] = this.linkQ(item, $element[0].innerHTML, $element.parent(), after);
                    }, this );
                } ) );
            }
        };
    })
    .directive('rowArray', function($animate, $compile, $q) {
        return {
            restrict: 'A',
            terminal: true,
            require: ['rowArray', '?^screens'],
            bindToController: {
                'array': '<rowArray',
                'arrayArgs': '<',
                'rCols': '@rowColumns',
                'cBreak': '@columnBreakpoint',
                'rClass': '@rowClass',
                'cClass': '@columnClass',
                'fcClass': '@firstColumnClass',
                'lcClass': '@lastColumnClass'
            },
            scope: true,
            controllerAs: 'rowArray',
            controller: function ($scope, $element, $attrs) {
                $element.addClass('hide');
                this.$onInit = function () {
                var rCols = parseInt(this.rCols),
                    cBreak = this.cBreak || 'xs',
                    cClass = angular.isString( this.cClass ) ? ( this.cClass + ' ' ) : '',
                    fcClass = angular.isString( this.fcClass ) ? ( this.fcClass + ' ' ) : cClass,
                    lcClass = angular.isString( this.lcClass ) ? ( this.lcClass + ' ' ) : cClass,
                    rClass = angular.isString( this.rClass ) ? ( this.rClass + ' ' ) : '',
                    rowTemplate = angular.element('<div></div>').addClass( rClass + 'row' );
                    this.$itemElements = {};
                    this.items = {};
                    this.linkQ = function ( scope, template, pQ, aQ, enter ) {
                            return $q(angular.bind(this, function(resolve) {
                                ( ( pQ && pQ.then ) ? pQ : $q( function (r) { r(pQ); } ) ).then( angular.bind( this, function ( resolve, scope, pElement ) {
                                ( ( aQ && aQ.then ) ? aQ : $q( function (r) { r(aQ); } ) ).then( angular.bind( this, function ( resolve, scope, pElement, aElement ) {
                                    $compile( template )( scope, angular.bind( this, function ( resolve, pElement, aElement, clone, scope ) {
                                            if(enter) {
                                                $animate.enter( clone, pElement, aElement ).then( angular.bind( this, function ( resolve, clone) {
                                                    resolve( clone );
                                                }, resolve, clone ) );
                                            }
                                            else {
                                                if(aElement) {
                                                    aElement.after(clone);
                                                }
                                                else  {
                                                    pElement.append(clone);
                                                }
                                                resolve( clone );
                                            }
                                    }, resolve, pElement, aElement ) );
                                }, resolve, scope, pElement ) );
                            }, resolve, scope ) );
                            }));
                    };
                    this.linkRow = this.linkQ( $scope, rowTemplate, $element.parent(), $element, true);
                    if(angular.isFunction(this.array)) {
                        this.array(this.arrayArgs).$promise.then( angular.bind($scope, function ( result ) {
                            this.choices = result;
                        }));
                    }
                    else {
                        $scope.choices = this.array;
                    }
                $scope.$watchCollection('choices', angular.bind(this, function (cChoices, pChoices, scope) {
                    if(!angular.isArray(cChoices) || !cChoices.length) {
                        return;
                    }
                    if(!angular.isDefined(this.linkColumns)) {
                      if(!rCols) {
                        rCols = Math.min(Math.ceil(600/(12*cChoices[0].maxLength)), 12);
                      }
                      var columnsQs = [];
                      for( var cIndex = 0; cIndex < rCols; cIndex ++ ) {
                        var ccClass = ((cIndex == 0) ? fcClass : ((cIndex == (rCols-1)) ? lcClass : cClass)),
                            colTemplate = angular.element('<div></div>').addClass( ccClass + 'col' + '-' + cBreak + '-' + parseInt( 12 / rCols ) );
                        columnsQs.push( this.linkQ( $scope, colTemplate, this.linkRow, ( cIndex > 0 ) ? columnsQs[cIndex - 1] : undefined) );
                      }
                      this.linkColumns = $q.all( columnsQs );
                    }
                    this.linkColumns.then(angular.bind(this, function (columns) {
                        this.itemsPerCol = parseInt( Math.ceil( cChoices.length / rCols ) );
                        angular.forEach( cChoices, function (choice, index, choices) {
                            var item = this.items[index],
                                afterColumnIndex = parseInt( Math.floor( ( index - 1 ) / this.itemsPerCol ) ),
                                columnIndex = parseInt( Math.floor( index / this.itemsPerCol ) ),
                                after = ( index > 0 && ( afterColumnIndex == columnIndex ) ) ? this.$itemElements[index - 1] : undefined, 
                                parentColumn = columns[columnIndex];
                            if( !angular.isObject( item ) ) {
                                item = scope.$new();
                            }
                            item.item = choice;
                            item.$index = index;
                            item.last = (index == (choices.length-1));
                            if(index < cChoices.length ) {
                                item.$index = index;
                                this.$itemElements[index] = this.linkQ( item, $element[0].innerHTML, columns[columnIndex], after, true);
                            }
                        }, this );
                    }));
                }));
                };
            }
        };
    })
    .directive('modelField', function($animate, $compile, $templateRequest, $q, $timeout, models) {
        return {
            restrict: 'E',
            require: ['^modelForm', 'modelField', '?^screens'],
            transclude: true,
            bindToController: {
                name: '@',
                alwaysVisible: '<',
                value: '<'
            },
            scope: true,
            link: function (scope, element, attrs, ctrls, transclude) {
                    var modelForm = ctrls[0],
                        modelField = ctrls[1],
                        screens = ctrls[2];
                    modelField.$addToForm(modelForm);
                    transclude(scope, function (clone, scope) {
                        modelField.transclude([clone, scope, {
                            transcludeControllers: {
                                screens: {
                                    instance: screens
                                },
                                modelField: {
                                    instance: modelField
                                },
                                modelForm: {
                                    instance: modelForm 
                                }
                            }
                        }]);
                    });
            },
            controllerAs: 'field',
            controller: function modelField ($scope, $element, $attrs, $transclude) {
                this.$onInit = function () {
                  this.$addToForm = function (modelForm) {
                    this.$form = modelForm;
                    this.path = this.$form.model.schema.paths[this.name];
                    this.$form.fields.push(this);
                    this.$index = this.$form.fields.length;
                    this.$valid = true;
                    this.$empty = true;
                    this.activateHandlers = [];
                    if(this.$index) {
                        this.prev = this.$form.fields[this.$index-1];
                        this.prev.next = this;
                    }
                    this.isMultiRef = function () {
                        return angular.isArray(this.path.options.type) && this.path.options.type.length && this.path.options.type[0].ref;
                    }
                    if(this.path.options.ref) {
                        this.ref = models[this.path.options.ref];
                        this.initRef = angular.bind(this, function(opts) {
                            this.value = new this.ref(opts);
                            this.setValidity(false);
                        });
                        this.setRef = function (value) {
                            this.value = value;
                            if(angular.isObject(this.value)) {
                                this.value.$submitted = true;
                            }
                        }
                    }
                    else if(this.isMultiRef()) {
                        this.ref = models[this.path.options.type[0].ref];
                        this.setCount = angular.bind(this, function fieldSetCount(count) {
                            var value = this.value || [],
                                count = parseInt(count);
                            this.setValidity(true);
                            for(var i=0; i < count; i++) {
                                if(value.length <= i) {
                                    value.push(new this.ref());
                                    this.setValidity(false);
                                }
                            }
                            this.value = value.slice(0, count);
                            angular.forEach(this.value, function(e, i) {
                                e.validate(angular.bind(this, function(error) {
                                    if(error) {
                                        this.setValidity(false);
                                    }
                                }));
                            }, this);
                        });
                    }
                    if(this.path.mask) {
                        this.splittedMask = this.path.options.mask.split(' ');
                        this.getJoined = function getJoined (index, value) {
                            var parts = (field.value||'').split(' '),
                                outParts = [];
                            for(var i=0; i < field.splittedMask.length; i++) {
                                if(i == index) {
                                    outParts.push(value);
                                }
                                else {
                                    if(i < parts.length) {
                                        outParts.push(parts[i]);
                                    }
                                    else {
                                        outParts.push('');
                                    }
                                }
                             }
                             return (outParts.join(' '));
                        }
                    }
                    Object.defineProperty(this, 'value', {
                      get: function() {
                        return this.$form.instance[this.name];
                      },
                      set: function(value) {
                        this.$form.instance[this.name] = value;
                        var prev, isVisibleFn = this.$form.instance.isVisible;
                        for(var prevIndex = this.$index-1; prevIndex >= 0; prevIndex --) {
                            prev = this.$form.fields[prevIndex]; 
                            if(!isVisibleFn || isVisibleFn(prev.name)) {
                                break;
                            } else {
                                prev = undefined;
                            }
                        }
                        var invisible = !this.alwaysVisible && isVisibleFn && !isVisibleFn(this.name);
                        var visible = this.alwaysVisible || ((angular.isDefined(value) || !prev || angular.isDefined(prev.value)));
                        if(!invisible && visible) {
                            this.setVisibility(true);
                        }
                        if(this.next) {
                            this.next.value = this.next.value;
                        }
                        if (invisible || !visible && (!this.next || !this.next.visible)) {
                            this.setVisibility(false);
                        }
                        this.setEmpty(!angular.isDefined(value));
                        if(angular.isFunction(this.$form.instance.display)) {
                            this.displayValue = this.$form.instance.display(this.name) || '';
                        }
                        this.$form.fieldUpdated();
                      }
                    });
                    this.$transcludeQ = $q(angular.bind(this, function (resolve) {
                        this.transclude = resolve;
                    }));
                    this.setValidity = function (valid) {
                        this.$valid = valid;
                    }
                    this.setEmpty = function (empty) {
                        this.$empty = empty;
                    }
                    this.linkField = function (linkCloneFn) {
                        var tpl = this.path.options.template; 
                        $q.all([this.$transcludeQ, tpl ? $templateRequest(this.path.options.template) : null]).then(function (args) {
                            var clone = args[0][0],
                                scope = args[0][1],
                                linkOptions = args[0][2],
                                template = args[1];
                            if(template) {
                                angular.forEach(clone, function (e) {
                                    template += (e.outerHTML||'');
                                });
                            }
                            $compile(template||clone)(scope, linkCloneFn, linkOptions);
                        });
                    };
                    this.updateErrors = angular.bind(this, function($error, $valid, $empty) {
                        this.$errorMessages = [];
                        angular.forEach($error, function(invalid, errKey) {
                            if(this.$form.instance.getPathErrorMessage) {
                                var message = this.$form.instance.getPathErrorMessage(this.name, errKey);
                                if(invalid && this.$errorMessages.indexOf(message) == -1) {
                                    this.$errorMessages.push(message);
                                }
                            }
                        }, this);
                        this.setValidity($valid);
                        this.setEmpty($empty);
                        this.$form.fieldUpdated();
                    });
                    this.setVisibility = angular.bind(this, function (visible) {
                        this.visible = visible;
                        if (!angular.isDefined(this.$fieldEl)) {
                            if (this.visible || (this.$index == 0)) {
                                var prevEl;
                                for(var prevIndex = (this.$index-1); prevIndex >= -1; prevIndex--) {
                                    if(prevIndex >= 0) {
                                        prevEl = this.$form.fields[prevIndex].$fieldEl;
                                    }
                                    else {
                                        prevEl = undefined;
                                    }
                                    if(prevEl) {
                                        break;
                                    }
                                }
                                this.$fieldEl = $q(angular.bind(this, function (resolve) {
                                    this.linkField(angular.bind(this, function (prevEl, resolve, fieldEl, scope) {
                                        (prevEl||$q(function(r){r();})).then(angular.bind(this, function(prevEl) {
                                            $animate.enter(fieldEl, $element);
                                        }));
                                        resolve(fieldEl);
                                    }, prevEl, resolve));
                                }));
                            }
                        }
                        else if (!this.visible) {
                            this.$fieldEl.then(function(fieldEl){
                                $animate.leave(fieldEl);
                            });
                            delete this.$fieldEl;
                        }
                    });
                    this.onActivate = function (handler) {
                        this.activateHandlers.push(handler);
                    };
                    this.setValidators = function (ngModel) {
                        var self = this;
                        ngModel.$asyncValidators.schemaValidator = function (modelValue, viewValue) {
                            return $q(function (resolve, reject) {
                                var opts = {};
                                opts[self.name] = viewValue;
                                self.$form.instance.validate(function (error) {
                                    if(!error||error.errors[self.name]==undefined) {
                                        resolve();
                                    }
                                    else {
                                        reject();
                                    }
                                }, opts);
                            });
                        };
                    }
                    this.enterKeyPressed = function (input) {
                        input.triggerHandler('blur');
                        if(this.next) {
                            this.next.activate();
                        }
                    };
                    this.setActive = function (active, apply) {
                        this.$active = active;
                        if(apply) {
                            $scope.$apply();
                        }
                    };
                    this.activate = function () {
                        this.activateHandlers.forEach(function (handler) {
                            handler();
                        });
                        this.$active = true;
                    };
                    this.value = this.value;
                  };
                };
              }
            };
        })
        .directive('modelForm', function ($compile, $animate, $templateRequest, $q, models) {
            return {
                restrict: 'E',
                require: ['^modelForm', '?^screens', '?^modelField'],
                transclude: true,
                bindToController: {
                    'model': '<src',
                    'defaults': '<',
                    'extra': '<',
                    'onReady': '&',
                    'focusInput': '<',
                    'exclude': '@excludeFields',
                    'instance': '<'
                },
                scope: {
                    'instance': '='
                },
            controllerAs: 'modelForm',
            link: function (scope, element, attrs, ctrls) {
                var modelForm = ctrls[0],
                    screens = ctrls[1],
                    modelField = ctrls[2];
               /*
                modelForm.setParentField(modelField);
                if(modelForm.focusInput) {
                    $animate.on('removeClass', element, function (e, phase) {
                        if(phase == 'close' && !e.hasClass('ng-hide')) {
                            var input = e.find('input');
                            if(input.length && angular.isFunction(input[0].focus) ) {
                                input[0].focus();
                            }
                        }
                    });
                }*/
                scope.$watch('instance', function(newVal, oldVal) {
                    modelForm.$postInit();
                });
            },
            controller: function modelForm ($scope, $element, $attrs, $transclude) {
                this.$enterQ = $q(angular.bind(this, function (resolve) {
                    $transclude( $scope, function (clone, scope) {
                        $animate.enter(clone, $element).then(function () {
                            resolve();
                        });
                    });
                }));
                this.$postInit = function () {
                    this.$enterQ.then(angular.bind(this, function () {
                        angular.forEach(this.fields, function (field) {
                            field.$postInit(this);
                        }, this);
                    }));
                }
                /*
                this.setParentField = angular.bind(this, function (field) {
                    this.parentField = field;
                });
                    if ( !angular.isObject(this.instance) || 
                         !angular.isObject(this.instance.model) ||
                         angular.isObject(this.model) && this.instance.model.modelName != this.model.modelName ) {
                        angular.forEach( this.defaults, function (value, pathName) {
                            this[pathName] = value;
                        }, this.instance );
                    }*/
                this.fields = [];
                this.fieldNames = [];
                /*
                    this.fieldUpdated = angular.bind(this, function () {
                        this.$totalEmpty = 0;
                        this.$totalInvalid = 0;
                        this.$totalValid = 0;
                        angular.forEach(this.fields, function (field) {
                            var isVisible = !angular.isFunction(this.instance.isVisible)||this.instance.isVisible(field.name);
                            if(isVisible) {
                                if(field.$empty) {
                                    this.$totalEmpty ++;
                                }
                                if(!field.$valid) {
                                    this.$totalInvalid ++;
                                }
                                else {
                                    this.$totalValid ++;
                                }
                            }
                        }, this);
                        if(this.parentField) {
                            this.parentField.updateErrors(this.$totalInvalid ? {complex: true} : undefined, this.$totalInvalid == 0, this.$totalEmpty > 0);
                        }
                        this.onReady($scope);
                    });
                this.exclude = (this.exclude || '').trim();
                this.exclude = this.exclude.split(' ').map( function (name) {
                    return name.trim();
                });
                this.include = (this.include || '').trim();
                if(this.include.length) {
                    this.include = this.include.split(' ').map( function (name) {
                        return name.trim();
                    });
                }
                this.save = function () {
                    this.instance.$save(angular.bind(this, function (feedback) {
                        this.instance.$submitted = true;
                    }));
                };
                */
                /*
                angular.forEach(this.model.schema.paths, function ( path, name, __, linkFn ) {
                if( !angular.isDefined( path ) ) {
                    if( !(name in this.model.schema.paths) ) {
                        console.warn("Can't find path " + name + " for " + this.model.modelName + " model");
                        return;
                    }
                    else {
                        path = this.model.schema.paths[name];
                    }
                }
                if( !angular.isString( path.options.template ) && !angular.isFunction( linkFn ) ){
                    return;
                }
                if( ( ( angular.isArray(this.include) && this.include.length ) ? this.include.indexOf( name ) : false ) ||
                    ( this.exclude.indexOf( name ) > -1 ) || 
                    !( angular.isString( name ) ) || 
                    ( name.length == 0 ) || 
                    ( name[0] == '_' ) ) {
                    return;
                }*/
                this.fieldNames.push(name);
                //}, this);
              }
            //}
        };
    })
    .directive('screens', function($animate, $timeout) {
        return {
            restict: 'A',
            bindToController: {
            },
            controllerAs: 'screens',
            controller: function screenCtrl ($scope, $element, $attrs) {
                this.$onInit = function () {
                    var sElements = [],
                        loader = {
                            delay: 10,
                            cssClass: 'loading'
                        };
                    this.activate = function (sElement) {
                        sElements.push(sElement);
                        this.update();
                    };
                    this.deactivate = function (sElement) {
                        var index = sElements.indexOf(sElement);
                        if(index >= 0) {
                            sElements.splice(index, 1);
                            this.update();
                        }
                    };
                    this.update = function () {
                        if(loader.finish) {
                            $timeout.cancel(loader.finish);
                        }
                        var minHeight = 0;
                        angular.forEach(sElements, function (sElement) {
                           var newMinHeight = parseInt(sElement[0].clientHeight);
                           if(minHeight < newMinHeight) {
                               minHeight = newMinHeight;
                           }
                        });
                        $element.addClass(loader.cssClass);
                        $element.css('min-height', minHeight + 'px'); 
                        loader.finish = $timeout(function() {
                            $element.removeClass(loader.cssClass);
                            delete loader.finish;
                        }, loader.delay);
                    };
                };
            }
        };
    })
    .directive('screen', function($animate) {
        return {
            restict: 'E',
            require: '^screens',
            link: function(scope, element, attrs, ctrl) {
                ctrl.activate(element);
                var enable = function (e, phase) {
                        if(phase == 'close' && !e.hasClass('ng-hide')) {
                            ctrl.update();
                        }
                    },
                    disable = function (e, phase) {
                        if(phase == 'close' || e.hasClass('ng-hide')) {
                            if(e == element) {
                                ctrl.deactivate(element);
                            }
                        }
                    };
                $animate.on('enter', element, enable);
                $animate.on('removeClass', element, enable);
                $animate.on('leave', element,  disable);
                $animate.on('addClass', element,  disable);
            }
        };
    })
    .directive('ngModel', function($q, $compile, $timeout) {
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
    })
    .controller('KaskoCalculator', function($scope, $timeout, Feedback, Car, CarBrand, DiscountInfo){
        $scope.models = {
            Feedback: Feedback,
            CarBrand: CarBrand,
            Car: Car,
            DiscountInfo: DiscountInfo
        };
        function cleanModelInstance(model, instance) {
            angular.forEach( model.schema.paths, function (path, pathName ) {
                var value = instance[pathName];
                if( pathName.length && ( pathName[0] == '_' || pathName[0] == '$' ) ) {
                    delete instance[pathName];
                    return;
                }
                if(angular.isObject(value) && '$$hashKey' in value) {
                    value = angular.merge({}, value);
                    delete value.$$hashKey;
                    instance[pathName] = value; 
                }
                if( path.options.ref ) {
                    if( angular.isObject(value) ) {
                        if( angular.isString( value._id ) ) {
                            instance[pathName] = value._id;
                        }
                        else {
                            delete value._id;
                            var model = $scope.models[path.path],
                                refInstance = new model( value );
                            refInstance.save( function( err, doc ) {
                                $scope.models[path.path] = doc;
                            } );
                        }
                    }
                }
            } );
        }
        $scope.newFeedback = function newFeedback ( defaults ) {
            var instance = new $scope.models.Feedback( defaults );
            for( var pathName in $scope.models.Feedback.schema.paths ) { 
                instance.setValidity( pathName, false );
            }
            //instance.fullName = "ewrwe ewrwer";
            //instance.$submitted = true;
            return instance;
        };
        /*
        $scope.$watch( 'feedback.car', function (newVal, oldVal, scope) {
            if( newVal && typeof(newVal) != 'object' ) {
                $scope.feedback.car.brand = CarBrand.get({id: newVal});
            }
        });
        $scope.$watch( 'feedback.car.label', function (newVal, oldVal, scope) {
            if( newVal ) {
                scope.feedback.setValidity('car', true);
            }
            else if ( scope.feedback ) {
                scope.feedback.setValidity('car', false);
            }
        } );
        */
        //$scope.feedback = $scope.newFeedback();
        //$scope.discountInfo = new DiscountInfo();
        //$scope.feedback.$submitted = true;  
        /*
        $scope.discountInfo = angular.extend(new DiscountInfo(), {
            fullName: 'name name name',
            birthDate: '5.11.2017',
            licenceId: '1234 567890'
        });
        */
        /*
        $scope.feedback = angular.extend(new Feedback(), {
            //car: { brand: {_id: "57238136306c653bf7f6ba87"}, $input: 'brand' },
            year: Feedback.schema.paths.year.options.enum[0],
            capacity: "21312",
            price: Feedback.schema.paths.price.options.enum[0],
            city: Feedback.schema.paths.city.options.enum[0],
            type: [Feedback.schema.paths.type.options.enum[0]],
            franchise: Feedback.schema.paths.franchise.options.enum[0],
            franchiseSum: 1000,
            fullName: "ewrwe ewrwer",
            //phoneNumber: "+7 (342) 342 34 23"
        });
        //$scope.saveFeedback();
        Car.findOne({}, function(err, car) {
            var defaults = {
                car: car,
                year: Feedback.schema.paths.year.options.enum[0],
                capacity: 100,
                price: Feedback.schema.paths.price.options.enum[0],
                city: Feedback.schema.paths.city.options.enum[0],
                driversCount: Feedback.schema.paths.driversCount.options.enum[0],
                type: [Feedback.schema.paths.type.options.enum[0]],
                //type: {},
                franchise: Feedback.schema.paths.franchise.options.enum[0],
                franchiseSum: 1000,
                fullName: 'John Smith',
                phoneNumber: '+7 (123) 456 78 90'
            };
            $scope.feedback = $scope.newFeedback(); 
            for(var pathName in Feedback.schema.paths) {
                var value = Feedback.schema.paths[pathName].defaultValue;
                if(value) {
                    $scope.feedback[pathName] = value;
                }
            }
            angular.forEach( defaults, function( value, pathName ) {
                $scope.feedback[pathName] = value;
                this.setValidity( pathName, true );
            }, $scope.feedback);
        });
        */
    })
})();
