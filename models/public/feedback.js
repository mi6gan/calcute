var angoose = require("angoose");
var mongoose = angoose.getMongoose();
var carBrandSchema = new mongoose.Schema({
        icon: {type: String},
        label: {type: String},
    }),
    carSchema = new mongoose.Schema({
        label: {type: String},
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CarBrand'
        }
    }),
    feedbackSchema = new mongoose.Schema({
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car'
        },
        year: {type: Number, min: 2000}
    });
var findSorted = function (query, fields, options) {
    return this.find(query, fields, options).sort('label');
};
carBrandSchema.statics.findSorted = findSorted;
carSchema.statics.findSorted = findSorted;
feedbackSchema.statics.getYearsRange = function remote($callback) {
    var min = feedbackSchema.paths.year.options.min,
        max = (new Date()).getFullYear(),
        years = Array();
    for(var i = max; i >= min; i--) {
        years.push(i);
    }
    $callback(null, years);
};
var Car = mongoose.model('Car', carSchema),
    CarBrand = mongoose.model('CarBrand', carBrandSchema),
    Feedback = mongoose.model('Feedback', feedbackSchema);
exports.Car = Car;
exports.CarBrand = CarBrand;
exports.Feedback = Feedback;
