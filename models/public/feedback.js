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
            max: 1000,
            label: 'Двигатель, л.с',
            helpText: 'Если не помните точное число, укажите примерное',
            inputAttrs: {
                placeholder: '275,00',
                size: 4
            },
            masker: ['999', '99'],
            maskerSeparator: ',', 
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
        /*
        drivers: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Driver'
            }],
            label: 'Водители',
            template: '/templates/fields/drivers.html'
        },
        */
        driversCount: {
            type: Object,
            label: 'Количество водителей',
            choices: [
                {label: '1'},
                {label: '2'},
                {label: '3'},
                {label: 'Неограниченно'}
            ],    
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
            mask: '9999999',
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
            masker: ['AAAAAAAAAAAAAAAAAAAAAAAAAA', 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAA'], 
            maskerSeparator: 'space'
        },
        phoneNumber: {
            type: String,
            default: '+7',
            inputAttrs: {
                size: 20,
                minLength: 9,
                maxLength: 20,
                placeholder: '+7',
            },
            masker: '+9 (999) 999 99 99',
            label: 'Номер телефона',
            template: '/templates/fields/input.html'
        }
    }),
    driverSchema = new mongoose.Schema({
        gender: {
            type: Object,
            choices: [
                {'label': 'Муж'},
                {'label': 'Жен'}
            ],
            template: '/templates/fields/simpleSelect.html'
        },
        age: {
            type: Number,
            masker: '99',
            template: '/templates/fields/simpleInput.html',
            default: 25
        },
        experience: {
            type: Number,
            masker: '99',
            template: '/templates/fields/simpleInput.html',
            default: 2
        }
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
var Car = mongoose.model('Car', carSchema),
    CarBrand = mongoose.model('CarBrand', carBrandSchema),
    Feedback = mongoose.model('Feedback', feedbackSchema),
    Driver = mongoose.model('Driver', driverSchema);
exports.Car = Car;
exports.CarBrand = CarBrand;
exports.Feedback = Feedback;
exports.Driver = Driver;
