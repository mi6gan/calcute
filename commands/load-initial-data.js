var models = require('../models/feedback.js'),
    fs     = require('fs'),
    terminate = false,
    angoose = require('angoose'),
    promise = require('mpromise');

var data = fs.readFileSync('fixtures/legacy.json'),
    jsonData = JSON.parse(data),
    icons = {
        BMW: '/assets/build/images/brand-1.png',
        Audi: '/assets/build/images/brand-2.png',
        Ford: '/assets/build/images/brand-3.png',
        Honda: '/assets/build/images/brand-4.png',
        Hyundai: '/assets/build/images/brand-5.png',
        Mazda: '/assets/build/images/brand-6.png'
    };
angoose.mongoose.connect('localhost/calcute');
jsonData.brands.forEach(function(brand) {
    models.CarBrand.findOneAndUpdate({label: brand.text}, {label: brand.text, icon: icons[brand.text]||null}, {upsert: true}, function(err, brandDoc) {
        console.log('Adding brand ' + brand.text + '\n');
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
                }
            );
        });
    });
});
