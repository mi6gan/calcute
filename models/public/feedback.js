var angoose = require("angoose"),
    mongoose = angoose.getMongoose(),
    schemas = {
    CarBrand: new mongoose.Schema({
        icon: {type: String},
        label: {type: String},
    }),
    Car: new mongoose.Schema({
        label: {type: String},
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CarBrand'
        }
    }),
    Feedback: new mongoose.Schema({
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car',
            label: 'Автомобиль'
        },
        year: {
            type: Object,
            min: 2000,
            enum: (function() {
                var arr = [];
                for(var i = 0; i < 17; i++) {
                    if(i == 16) {
                        arr.push({
                            id: i,
                            label: '2000 и старше'
                        });
                    }
                    else {
                        arr.push({
                            id: i,
                            label: 2016 - i
                        });
                    }
                }
                return arr;
            })(),
            label: 'Год выпуска',
            template: '/templates/fields/select.html'
        },
        capacity: {
            type: String,
            min: 1,
            max: 1000,
            label: 'Двигатель, л.с',
            helpText: 'Если не помните точное число, укажите примерное',
            inputAttrs: {
                size: 4
            },
            masker: 'C',
            inputSuffix: 'лошадиных сил',
            template: '/templates/fields/input.html'
        },
        price: {
            type: Object,
            enum: [
                {id: 0, label: 'до 500 тыс'},
                {id: 1, label: 'от 500 тыс – 1 млн'},
                {id: 2, label: 'от 1 млн – 1,5 млн'},
                {id: 3, label: 'от 1,5 млн – 2 млн'},
                {id: 4, label: 'от 2 млн'}
            ],
            label: 'Стоимость авто',
            template: '/templates/fields/select.html'
        },
        city: {
            type: Object,
            enum: [
                {id: 0, label: 'Москва и МО'},
                {id: 1, label: 'Спб'},
                {id: 2, label: 'Екатеринбург'},
            ],
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
            enum: [
                {id: 0, label: '1'},
                {id: 1, label: '2'},
                {id: 2, label: '3'},
                {id: 3, label: 'Неограниченно'}
            ],    
            template: '/templates/fields/select.html'
        },
        type: {
            type: [Object],
            enum: [
                    {id: 0, label: 'КАСКО'},
                    {id: 1, label: 'ОСАГО'},
                    {id: 2, label: 'ДАГО (расширение ОСАГО)'},
            ],
            label: 'Что считаем?',
            template: '/templates/fields/multiselect.html'
        },
        franchise: {
            type: Object,
            enum: [
                {id: 0, label: 'Да'},
                {id: 1, label: 'Нет'},
                {id: 2, label: 'Возможно'}
            ],
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
            masker: 'R',
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
            masker: 'N N'
        },
        phoneNumber: {
            type: String,
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
    Driver: new mongoose.Schema({
        gender: {
            type: Object,
            enum: [
                {id: 0, 'label': 'Муж'},
                {id: 1, 'label': 'Жен'}
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
    })
};
schemas.Feedback.methods.display = function portable ( pathName ) {
    var value = this[pathName];
    switch( pathName ) {
        case 'car':
            if( typeof( value ) == 'object' ) {
                if ( typeof( value.brand ) == 'object' ) {
                    return value.brand.label + ' ' + value.label;
                }
            }
            break;
        case 'capacity':
            return value + ' лс';
        case 'franchise':
            return ( ( value.id == 0) || ( value.id == 2 ) ) ? 'Франшиза' : '';
        case 'franchiseSum':
            return value + ' руб';
        case 'driversCount':
            return value.label + ( ( value.id == 0 ) ? " водитель" : ( value.id == 3 ) ? "" : " водителя" );
        case 'type':
            if( typeof( value ) == 'object' && value.length ) {
                return value.map( function ( v ) {
                    return v.label;
                } ).join(', ');
            }
            else {
                return;
            }
        default:
            if ( ( typeof(value) == 'object' ) && ( 'label' in value ) ) {
                return value.label;
            }
    }
    return (typeof( value ) == 'object') ? value.label : String( value );
}
//========= initialize models and methods ==========
for( var schemaName in schemas ) {
    ( function initSchemaBase ( schemaName ) {
        this.statics.getPathErrorMessage = function portable (pathName, errorKey) {
            var messages = {
                $: {
                    $: "введите правильное значение" ,
                    required: "данное поле не может быть пустым"
                }
            },
            pathMessages = ( messages[pathName] || messages.$ );
            return pathMessages[errorKey] ||
               messages.$[errorKey] ||
               pathMessages.$ ||
               messages.$.$;
        };
        this.methods.setValidity = function portable (pathName, valid) {
            if( pathName.length && pathName[0] == '_' ) {
                return;
            }
            if( ! ( '$valid' in this ) ) {
                this.$valid = [];
            }
            if( ! ( '$invalid' in this ) ) {
                this.$invalid = [];
            }
            var validIndex = this.$valid.indexOf( pathName ),
                invalidIndex = this.$invalid.indexOf( pathName );
            if( valid) {
                if ( validIndex == -1 ) {
                    this.$valid.push( pathName );
                }
                if ( invalidIndex != -1 ) {
                    this.$invalid.splice( invalidIndex, 1 );
                }
            }
            else {
                if ( invalidIndex == -1 ) {
                    this.$invalid.push( pathName );
                }
                if ( validIndex != -1 ) {
                    this.$valid.splice( validIndex, 1 );
                }
            }
        };
        exports[schemaName] = mongoose.model(schemaName, this);
    } ).call(schemas[schemaName], schemaName);
}
var f = new mongoose.models.Feedback();
