module.exports = function query($animate, $compile, $q){
    return {
        restrict: 'E',
        scope: true,
        link: function (scope, element, attrs) {
            var q = scope.$eval(attrs.promise),
                resolveTo = attrs.resolveTo||'items',
                groupBy = attrs.groupBy ? parseInt(attrs.groupBy) : null; 
            if(angular.isObject(q)&&!angular.isFunction(q.then)&&angular.isArray(q)){
                var items = q;
                q = $q(function(resolve){resolve(items);});
            }
            q.then(function(items){
                if(groupBy){
                    var groups = [],
                        total = parseInt(Math.ceil(items.length/groupBy));
                    for(var i=0; i<groupBy; i++){
                        groups.push([]);
                        var j=0;
                        for(j; j<total; ++j){
                            var index=i*total+j;
                            if(index>=items.length){break;}
                            groups[i].push(items[index]);
                        }
                        if(j<total){break;}
                    }
                    scope[resolveTo] = groups;
                } else {
                    scope[resolveTo] = items;
                }
            });
        }
    };
};
