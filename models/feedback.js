var angoose = require("angoose");
var mongoose = angoose.getMongoose();
var carBrandSchema = new mongoose.Schema({
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
        }
    }),
    Car = mongoose.model('Car', carSchema),
    CarBrand = mongoose.model('CarBrand', carBrandSchema),
    Feedback = mongoose.model('Feedback', feedbackSchema);
exports.Car = Car;
exports.CarBrand = CarBrand;
exports.Feedback = Feedback;
