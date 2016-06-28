(function initModule (schemas) {
    var mongoose = require('mongoose');
    schemas.Module = new mongoose.Schema({
        name: {type: String},
        domains: [String]
    });
    for( name in schemas) {
        if( name == 'schemas' ) {
            console.warn('skipping schema with hash key "schemas"');
        }
        else {
            this[name] = mongoose.model(name, schemas[name]);
        }
    }
    return schemas;
}).call(
    module.exports,
    require('./portable.js').schemas
);
