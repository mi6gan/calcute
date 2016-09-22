module.exports = function screen($animate){
    return {
        restict: 'E',
        require: '^screens',
        controllerAs: 'screen',
        controller: function($scope, $element, $attrs) {
            this.getHeight = function(){
                return $element[0] ? $element[0].clientHeight : 0;
            };
        }
    };
}
