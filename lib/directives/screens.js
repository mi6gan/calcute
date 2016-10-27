module.exports = function screens($animate, $timeout, $compile, $templateRequest) {
    return {
        restict: 'A',
        controllerAs: 'screens',
        controller: function screenCtrl ($scope, $element, $attrs){
            var minHeight = $element.css('min-height'),
                initialHeight = $element[0].clientHeight,
                loader = {
                    startDelay: 0,
                    durDelay: 0,
                    cssClass: 'loading',
                    pending: 0
                },
                self = this,
                template = $attrs.template;
            this.load = function load(screenEl){
                var screen = screenEl.controller('screen');
                if(!screen){return;}
                var screenHeight = screen.getHeight();
                if(screenHeight >= initialHeight){
                    initialHeight = 0;
                    $element.css('height', 'auto');
                }
                else {
                    screenHeight = initialHeight;
                }
                $element.css('min-height', (screenHeight || minHeight) + 'px');
            };
            $animate.on('enter', $element, function(screenEl, phase){
                self.load(screenEl);
            });
            $animate.on('leave', $element, function(screenEl, phase){
                self.load(screenEl);
            });
            if(template){
                $templateRequest(template).then(function(template) { $compile(template)($scope, function(clone, cScope){
                        $animate.enter(clone, $element);
                    });
                });
            }
            $element.css('height', initialHeight);
        }
    };
}
