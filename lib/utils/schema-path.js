module.exports = {
    isMultiRef: (path) => (
        angular.isArray(path.options.type) && 
        path.options.type.length &&
        path.options.type[0].ref
    )
};

var angular = require('angular');
