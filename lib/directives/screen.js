module.exports = function screen($animate){
    return {
        restict: 'E',
        require: '^screens',
        link: function(scope, element, attrs, ctrl) {
            ctrl.activate(element);
            var enable = function (e, phase) {
                    if(phase == 'close' && !e.hasClass('ng-hide')) {
                        ctrl.update();
                    }
                },
                disable = function (e, phase) {
                    if(phase == 'close' || e.hasClass('ng-hide')) {
                        if(e == element) {
                            ctrl.deactivate(element);
                        }
                    }
                };
            $animate.on('enter', element, enable);
            $animate.on('removeClass', element, enable);
            $animate.on('leave', element,  disable);
            $animate.on('addClass', element,  disable);
        }
    };
}
