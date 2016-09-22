module.exports = function screens($animate, $timeout) {
    return {
        restict: 'A',
        controllerAs: 'screens',
        controller: function screenCtrl ($scope, $element, $attrs){
            var minHeight = 100,
                loader = {
                    startDelay: 0,
                    durDelay: 0,
                    cssClass: 'loading',
                    pending: 0
                },
                self = this;
            this.load = function load(screenEl){
                var screen = screenEl.controller('screen');
                if(!screen){return;}
                $element.css('min-height', (screen.getHeight()||minHeight) + 'px'); 
            };
            $element.css('min-height', minHeight + 'px'); 
            $animate.on('enter', $element, function(screenEl, phase){
                self.load(screenEl);
            });
            $animate.on('leave', $element, function(screenEl, phase){
                self.load(screenEl);
            });
        }
    };
}
