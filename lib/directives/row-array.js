module.exports = function rowArray($animate, $compile, $q){
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
}
