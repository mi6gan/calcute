module.exports = function ngImg($animate, $timeout, $compile) {
    var settings = require('settings');
    return {
        restict: 'E',
        link: function ngImgLink(scope, element, attrs){
            var img = angular.element('<img/>'),
                src = scope.$eval(attrs.src);
            if(!src){return;}
            img.attr('src', settings.SERVICE_URL.replace(/\/$/, '') + '/' + src);
            img.attr('class', attrs['class']);
            $compile(img)(scope, function(clone, cScope){
                $animate.enter(clone, element);
            });
        }
    };
};
