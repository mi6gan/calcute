var fs      = require('fs'),
    angoose = require('angoose');

angoose.mongoose.connect('localhost/calcute');

(function loadCars() {
var models = require('../models/public/feedback.js'),
    data = fs.readFileSync('fixtures/legacy.json'),
    jsonData = JSON.parse(data),
    icons = {
        BMW: '/assets/build/images/brand-1.png',
        Audi: '/assets/build/images/brand-2.png',
        Ford: '/assets/build/images/brand-3.png',
        Honda: '/assets/build/images/brand-4.png',
        Hyundai: '/assets/build/images/brand-5.png',
        Mazda: '/assets/build/images/brand-6.png'
    };

    jsonData.brands.forEach(function(brand) {
        console.log('Adding brand ' + brand.text + '\n');
        models.CarBrand.findOneAndUpdate({label: brand.text}, {label: brand.text, icon: icons[brand.text]||null}, {upsert: true}, function(err, brandDoc) {
            if(err) {
                throw err;
            }
            brand.values.forEach(function(carLabel) {
                console.log('\tAdding car ' + carLabel);
                models.Car.findOneAndUpdate({
                    label: carLabel,
                    brand: brandDoc
                }, 
                {label: carLabel, brand: brandDoc},
                {upsert: true}, 
                function(err, doc) {
                    if(err) {
                        throw err;
                    }
                });
            });
        });
    });
})();

(function loadModules() {
    var Module = require('../models/protected/module.js'),
        data = fs.readFileSync('fixtures/modules.json'),
        jsonData = JSON.parse(data);

    jsonData.modules.forEach(function(module) {
        console.log('Adding module ' + module.name);
        Module.findOneAndUpdate({name: module.name}, module, {upsert: true}, function(err, moduleDoc) {
            if(err) {
                throw err;
            }
        });
    });
})();

