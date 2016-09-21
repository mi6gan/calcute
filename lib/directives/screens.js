module.exports = function screens($animate, $timeout) {
    return {
        restict: 'A',
        bindToController: {
        },
        controllerAs: 'screens',
        controller: function screenCtrl ($scope, $element, $attrs) {
            this.$onInit = function () {
                var sElements = [],
                    loader = {
                        delay: 10,
                        cssClass: 'loading'
                    };
                this.activate = function (sElement) {
                    sElements.push(sElement);
                    $timeout(() => {
                        this.update();
                    });
                };
                this.deactivate = function (sElement) {
                    var index = sElements.indexOf(sElement);
                    if(index >= 0) {
                        sElements.splice(index, 1);
                        this.update();
                    }
                };
                this.update = function () {
                    if(loader.finish) {
                        $timeout.cancel(loader.finish);
                    }
                    var minHeight = 0;
                    angular.forEach(sElements, function (sElement) {
                       var newMinHeight = parseInt(sElement[0].clientHeight);
                       if(minHeight < newMinHeight) {
                           minHeight = newMinHeight;
                       }
                    });
                    $element.addClass(loader.cssClass);
                    $element.css('min-height', minHeight + 'px'); 
                    loader.finish = $timeout(function() {
                        $element.removeClass(loader.cssClass);
                        delete loader.finish;
                    }, loader.delay);
                };
            };
        }
    };
}
