module.exports = function ngModelSet($compile, $animate, $q, models){
    'use strict';
    class Item {
        constructor(path, element, compileOpts, scope){
            this.path = path;
            this.compileOpts = compileOpts;
            this.$$element = element;
            this.$$clone = null;
            this.$$scope = scope;
        }
        destroy(){
            delete this.$$clone;
            this.$$clone = null;
        }
        element(){
            if(this.$$clone==null){
                var self = this;
                this.$$clone = $q(function(resolve){
                    $compile(self.$$element)(self.$$scope, function(clone, scope){
                        resolve(clone);
                    }, self.compileOpts);
                });
            }
            return this.$$clone;
        }
        visible(){
            return (this.$$clone!=null);
        }
    }
    return {
        restrict: 'E',
        require: {form: '^form', screen: '?^screen', screens: '?^screens'},
        controllerAs: 'ngModelSet',
        bindToController: true,
        controller: function($scope, $element, $attrs){
            this.items = [];
            this.indices = {};
            this.totalVisible = 0;
            this.add = function(path, element, scope){
                var item = new Item(path, element, {transcludeControllers:{
                    ngModelSet: {instance: this},
                    form: {instance: this.form},
                    screen: {instance: this.screen},
                    screens: {instance: this.screens}
                }}, scope);
                this.indices[path] = this.items.length;
                this.items.push(item);
            };
            this.getNext = function(path){
                var index = this.indices[path];
                if(!angular.isNumber(index)){index = -1;}
                index++;
                if(index>0&&index<this.items.length){
                    return this.items[index];
                }
            }
            this.getPrev = function(path){
                var index = (this.indices[path]||-1);
                for(var i=index-1; i>=0; --i){
                    var item = this.items[i]; 
                    if(item.visible()){return item;}
                }
            }
            this.hide = function(item, single){
                if(angular.isString(item)){
                    var index = this.indices[item];
                    item = this.items[index];
                }
                if(!item||!item.visible()){return;}
                var self = this;
                item.element().then(function(element){
                    $animate.leave(element).then(function(){
                        if($attrs.watchState&&self.ignoreState.indexOf(item.path)==-1){
                            $scope[$attrs.watchState].visible -= 1;
                            $scope[$attrs.watchState].hidden += 1;
                        }
                        item.destroy();
                    });
                });
                if(!single){this.hideNext(item.path);}
            }
            this.show = function(item){
                if(angular.isString(item)){
                    var index = this.indices[item];
                    item = this.items[index];
                }
                if(!item||item.visible()){return;}
                var prev = this.getPrev(item.path),
                    self = this;
                $q.all([item.element(), prev ? prev.element(): undefined]).then(function(resolved){
                    $animate.enter(resolved[0], $element, resolved[1]).then(function(){
                        if($attrs.watchState&&self.ignoreState.indexOf(item.path)==-1){
                            $scope[$attrs.watchState].visible += 1;
                            $scope[$attrs.watchState].hidden -= 1;
                        }
                        self.showPrev(item.path);
                    });
                });
            };
            this.showPrev = function(path){
                var prev = this.getPrev(path);
                if(prev){this.show(prev);}
            };
            this.showNext = function(path){
                var next = this.getNext(path);
                if(next){this.show(next);}
            };
            this.hideNext = function(path){
                var next = this.getNext(path);
                if(next){this.hide(next);}
            };
            this.showFirst = function(){
                if(this.items.length){this.show(this.items[0]);}
            };
            this.$onInit = function(){
                this.autoHide = $scope.$eval($attrs.autoHide);
                this.paths = $attrs.include.split(' ');
                this.template = $attrs.template;
                this.ignoreState = ($attrs.ignoreState||'').split(' ');
                angular.forEach(this.paths, function(path){
                    var $element = angular.element('<ng-model/>');
                    $element.attr('ng-model', path);
                    $element.addClass('path--' + path);
                    if($attrs.after){
                        $element.append($attrs.after);
                    }
                    if(this.template){$element.attr('template', this.template);}
                    this.add(path, $element, $scope);
                }, this);
                if($attrs.watchState){
                    $scope[$attrs.watchState] = {
                        visible: 0,
                        hidden: this.paths.length-this.ignoreState.length
                    };
                }
                if(this.autoHide){
                    this.showFirst();
                } else {
                    angular.forEach(this.paths, function(path){
                        this.show(path);
                    }, this);
                }
            }
        }
    };
};
