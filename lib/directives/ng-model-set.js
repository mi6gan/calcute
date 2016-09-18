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
        require: ['^form', 'ngModelSet'],
        controllerAs: 'ngModelSet',
        controller: function($scope, $element, $attrs){
            this.items = [];
            this.indices = {};
            this.add = function(path, element, compileOpts, scope){
                var item = new Item(path, element, compileOpts, scope);
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
        },
        link: function(scope, element, attrs, ctrls){
            var paths = attrs.include.split(' '),
                template = attrs.template,
                form = ctrls[0],
                ngModelSet = ctrls[1],
                hideEmpty = scope.$eval(attrs.hideEmpty);
            if(!paths.length){
                return;
            }
            scope.$watch(form.$name + '.$$ready', function(ready){
                angular.forEach(paths, function(path, i){
                    var $element = angular.element('<ng-model/>');
                    $element.attr('ng-model', path);
                    if(attrs.after){
                        $element.append(attrs.after);
                    }
                    if(template){$element.attr('template', template);}
                    ngModelSet.add(path, $element, {transcludeControllers: {
                        form: {instance: form},
                        ngModelSet: {instance: ngModelSet}
                    }}, scope);
                });
                form.pathChangeListeners.push(function(name, value){
                    if(paths.indexOf(name)<0){return;}
                    if(value){
                        if(hideEmpty){ngModelSet.show(name);}
                        else{ngModelSet.showNext(name);}
                    }
                    else {
                        if(hideEmpty){ngModelSet.hide(name);}
                        else{ngModelSet.hideNext(name);}
                    }
                });
                ngModelSet.showFirst();
            });
        }
    };
};
