module.exports.schemas = require('./portable.js').schemas;
/*
var easyimg = require('easyimage'),
    path = require('path');
module.exports.schemas.CarBrand.methods.getThumb = function () {
    var src = path.parse(this.icon),
        dst = path.format({
            root: '/static/cache/',
            dir: src.dir,
            name: src.name + '',
            ext: src.ext
        }),
        width = 100,
        height =100;

    easyimg.thumbnail({
        src: this.icon,
        dst: path, 
        width: width,
        height: height
    });
};*/
