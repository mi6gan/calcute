module.exports = {
    isMultiRef: (path) => (
        angular.isArray(path.options.type) && 
        path.options.type.length &&
        path.options.type[0].ref
    ),
    isRef: (path) => (
        Boolean(path.options.type.ref)
    )
};

var angular = require('angular');
