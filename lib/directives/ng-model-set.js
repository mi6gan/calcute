module.exports = function ngModelSet($timeout, $compile, $animate, $q, models){
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
            this.$$clone = null;
        }
        element(){
            if(this.$$clone==null){
                this.$$clone = $q(angular.bind(this, function(resolve){
                    $compile(this.$$element)(this.$$scope, function(clone, scope){
                        resolve(clone);
                    }, this.compileOpts);
                }));
            }
            return this.$$clone;
        }
        visible(){
            return (this.$$clone!=null);
        }
    }
    return {
        restrict: 'E',
        require: {form: '^form'},
        controllerAs: 'ngModelSet',
        bindToController: true,
        controller: function($scope, $element, $attrs){
            this.items = [];
            this.indices = {};
            this.add = function(path, element, scope){
                var item = new Item(path, element, {transcludeControllers:{
                    ngModelSet: {instance: this},
                    form: {instance: this.form}
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
            this.hide = function(item){
                if(angular.isString(item)){
                    var index = this.indices[item];
                    item = this.items[index];
                }
                if(!item||!item.visible()){return;}
                item.element().then(function(element){
                    $animate.leave(element);
                    item.destroy();
                });
                this.hideNext(item.path);
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
                    $animate.enter(resolved[0], $element, resolved[1]);
                });
                this.showPrev(item.path);
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
                angular.forEach(this.paths, function(path){
                    var $element = angular.element('<ng-model/>');
                    $element.attr('ng-model', path);
                    if($attrs.after){
                        $element.append($attrs.after);
                    }
                    if(this.template){$element.attr('template', this.template);}
                    this.add(path, $element, $scope);
                }, this);
                if(this.autoHide){
                    this.showFirst();
                }
                else {
                    angular.forEach(this.paths, function(path){
                        this.show(path);
                    }, this);
                }
            }
        }
    };
};
