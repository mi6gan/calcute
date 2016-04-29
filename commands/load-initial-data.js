var models = require('../models/feedback.js'),
    fs     = require('fs'),
    terminate = false,
    angoose = require('angoose'),
    promise = require('mpromise');

var data = fs.readFileSync('fixtures/legacy.json'),
    jsonData = JSON.parse(data);
angoose.mongoose.connect('localhost/calcute');
jsonData.brands.forEach(function(brand) {
    models.CarBrand.findOneAndUpdate({label: brand.text}, {label: brand.text}, {upsert: true}, function(err, brandDoc) {
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
