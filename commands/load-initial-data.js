var fs      = require('fs'),
    models = require('../lib/models/local.js'),
    mongoose = require('mongoose');

mongoose.connect('mongo/calcute');

function loadCars() {
    var data = fs.readFileSync('fixtures/legacy.json'),
        jsonData = JSON.parse(data),
        icons = {
            BMW: '/demo/images/brand-1.png',
            Audi: '/demo/images/brand-2.png',
            Ford: '/demo/images/brand-3.png',
            Honda: '/demo/images/brand-4.png',
            Hyundai: '/demo/images/brand-5.png',
            Mazda: '/demo/images/brand-6.png'
        };
    return Promise.all(jsonData.brands.map(function(brand){
        console.log('Adding brand ' + brand.text + '\n');
        return (new Promise(function(resolve, reject){ 
            models.CarBrand.findOneAndUpdate(
                {label: brand.text},
                {label: brand.text, icon: icons[brand.text]||null}, 
                {upsert: true, new: true},
                function(err, brandDoc) {
                    if(err){
                        reject(err);
                    }
                    else{
                      Promise.all(brand.values.map(function(carLabel) {
                        console.log('\tAdding car ' + carLabel);
                        var fullLabel = brand.text + ' ' + carLabel;
                        return new Promise(function(resolve, reject){
                            models.Car.findOneAndUpdate(
                                {label: carLabel, brand: brandDoc._id}, 
                                {label: carLabel, fullLabel: fullLabel, brand: brandDoc._id},
                                {upsert: true, new: true}, 
                                function(err, doc) {
                                    if(err){reject(err);}
                                    else{resolve();}
                                }
                            );
                        });
                      })).then(resolve);
                    }
                }
            );
        }));
    }));
}

function loadModules() {
    var Module = models.Module,
        data = fs.readFileSync('fixtures/modules.json'),
        jsonData = JSON.parse(data);
    return Promise.all(jsonData.modules.map(function(module) {
        return new Promise(function(resolve, reject){
            console.log('Adding module ' + module.name);
            Module.findOneAndUpdate({name: module.name}, module, {upsert: true}, function(err, moduleDoc) {
                if(err){reject(err);}
                else{resolve();}
            });
        });
    }));
}

function loadCompanies() {
    var Company = models.Company,
        data = fs.readFileSync('fixtures/companies.json'),
        jsonData = JSON.parse(data);
    return Promise.all(jsonData.companies.map(function(company) {
        return new Promise(function(resolve, reject){
            console.log('Adding company ' + company.title);
            Company.findOneAndUpdate(company, module, {upsert: true}, function(err, companyDoc) {
                if(err){reject(err);}
                else{resolve();}
            });
        });
    }));
}

module.exports.load = function(){ 
    return Promise.all([
        loadCars(),
        loadModules(),
        loadCompanies()
    ]);
}

if(require.main==module){
    module.exports.load().then(function(){
        console.log('successfully done');
        process.exit();
    },
    function(err){
        console.error(err);
        process.exit();
    });
}
