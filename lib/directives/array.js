'use strict';
module.exports = function array($animate, $compile, $q, $timeout){
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
    }
