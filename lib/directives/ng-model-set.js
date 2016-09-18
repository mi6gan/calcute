module.exports = function ngModelSet($compile, $animate, $q, models){
    return {
        restrict: 'E',
        require: ['^form', 'ngModelSet'],
        controllerAs: 'ngModelSet',
        controller: function($scope, $element, $attrs){
            var after  = $attrs.after;
            this.elements = {};
            this.paths = [];
            this.addElement = function(path, element){
                this.elements[path] = element;
                this.paths.push(path);
            };
            this.showNext = function(path){
                var index = this.paths.indexOf(path);
                if(index>=0&&index<this.paths.length){
                    this.show(this.paths[index]);
                }
            };
            this.show = function(path){
                if(!path){return;}
                this.elements[path].then(function(element){
                    var enter = $animate.enter(element, $element);
                    console.log(element.html());
                    if(after){
                        enter.then(function(){
                            $animate.enter(after, $element, element);
                        });
                    }
                });
            };
        },
        link: function(scope, element, attrs, ctrls){
            var paths = attrs.include.split(' '),
                template = attrs.template,
                form = ctrls[0],
                ngModelSet = ctrls[1];
            if(!paths.length){
                return;
            }
            scope.$watch(form.$name + '.$$ready', function(ready){
                angular.forEach(paths, function(path, i){
                    ngModelSet.addElement(path, $q(function(resolve){
                        var $element = angular.element('<ng-model/>');
                        $element.attr('ng-model', path);
                        if(template){
                            $element.attr('template', template);
                        }
                        $compile($element)(scope, function(clone, scope){
                            resolve(clone);
                        },
                        {
                            transcludeControllers: {
                                form: {instance: form},
                                ngModelSet: {instance: ngModelSet}
                            }
                        });
                    }));
                });
                ngModelSet.show(paths[0]);
            });
        }
    };
};
