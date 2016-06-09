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
            ref: 'Car',
            label: 'Автомобиль'
        },
        year: {
            type: Number,
            min: 2000,
            label: 'Год выпуска'
        },
        capacity: {
            type: String,
            min: 1,
            max: 999999,
            label: 'Двигатель, л.с',
            helpText: 'Если не помните точное число, укажите примерное',
            inputAttrs: {
                placeholder: '275,00',
                size: 4
            },
            mask: '999,99',
            inputSuffix: 'лошадиных сил',
            template: '/templates/fields/input.html'
        },
        price: {
            type: Object,
            choices: [
                {label: 'до 500 тыс'},
                {label: 'от 500 тыс – 1 млн'},
                {label: 'от 1 млн – 1,5 млн'},
                {label: 'от 1,5 млн – 2 млн'},
                {label: 'от 2 млн'}
            ],
            validate: function(val){ 
                return val in this.choices;
            },
            label: 'Стоимость авто',
            template: '/templates/fields/select.html'
        },
        city: {
            type: Object,
            choices: [
                {label: 'Москва и МО'},
                {label: 'Спб'},
                {label: 'Екатеринбург'},
            ],
            validate: function(val){ 
                return val in this.choices;
            },
            label: 'Город',
            template: '/templates/fields/select.html'
        },
        type: {
            type: Object,
            choices: [
                {label: 'КАСКО'},
                {label: 'ОСАГО'},
                {label: 'ДАГО (расширение ОСАГО)'},
            ],
            validate: function(val){ 
                return val in this.choices;
            },
            label: 'Что считаем?',
            template: '/templates/fields/select.html'
        },
        franchise: {
            type: Object,
            choices: [
                {label: 'Да'},
                {label: 'Нет'},
                {label: 'Возможно'}
            ],
            validate: function(val){ 
                return val in this.choices;
            },
            label: 'Франшиза',
            template: '/templates/fields/select.html'
        },
        franchiseSum: {
            type: Number,
            min: 1000,
            max: 9999999,
            inputAttrs: {
                size: 8
            },
            inputSuffix: 'рублей',
            label: 'Размер франшизы',
            template: '/templates/fields/input.html'
        },
        fullName: {
            type: String,
            inputAttrs: {
                size: 50
            },
            label: 'Полное имя',
            template: '/templates/fields/input.html',
            validate: [{
                validator: function(schema, v, cb) { 
                    return schema.statics[ngValidator](v, cb);
                }.bind(feedbackSchema),
                ngValidator: 'validateFullName',
                message: 'Укажите корректное полное имя' 
            }],
        },
        phoneNumber: {
            type: String,
            inputAttrs: {
                size: 20,
                minLength: 9,
                maxLength: 20
            },
            label: 'Номер телефона',
            template: '/templates/fields/input.html'
        },
            /*
            validatePath: function remote(path, value) {
                var errorMessage, validators = (path.validate instanceof Function) ? [path.validate] || path.validate;
                validators.forEach(function(validate) {
                    if(validate instanceof String) {
                        this.statics[validate]();
                    }
                    errorMessage = validate();
                    if(errorMessage) {
                        return false;
                    }
                }.bind(this));
                return errorMessage;
            }*/
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
feedbackSchema.statics.getPriceChoices = function remote($callback) {
    var min = feedbackSchema.paths.year.options.min,
        max = (new Date()).getFullYear(),
        years = Array();
    for(var i = max; i >= min; i--) {
        years.push(i);
    }
    $callback(null, years);
};
feedbackSchema.statics.validateFullName = function remote(value, $callback) {
    $callback( ( !value || !value.length || value.match(/^\s*?[\W\w]+?\s+?[\W\w]+\s*?$/) ) ? null : true);
};
var Car = mongoose.model('Car', carSchema),
    CarBrand = mongoose.model('CarBrand', carBrandSchema),
    Feedback = mongoose.model('Feedback', feedbackSchema);
exports.Car = Car;
exports.CarBrand = CarBrand;
exports.Feedback = Feedback;
