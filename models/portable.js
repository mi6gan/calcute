var mongoose = require('mongoose');

module.exports.schemas = {
    CarBrand: new mongoose.Schema({
        icon: String,
        label: String
    }),
    Car: new mongoose.Schema({
        label: String,
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CarBrand'
        }
    }),
    //
    Feedback: new mongoose.Schema({
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car',
            label: 'Автомобиль'
        },
        year: {
            required: true,
            type: String,
            min: 2000,
            enum: (function() {
                var arr = [];
                for(var i = 0; i < 17; i++) {
                    if(i == 16) {
                        arr.push('2000 и старше');
                    }
                    else {
                        arr.push((2016 - i).toString());
                    }
                }
                return arr;
            })(),
            label: 'Год выпуска',
            template: '/templates/fields/select.html'
        },
        capacity: {
            required: true,
            type: String,
            min: 1,
            max: 1000,
            label: 'Двигатель, л.с',
            helpText: 'Если не помните точное число, укажите примерное',
            inputAttrs: {
                size: 4
            },
            mask: 'C',
            inputSuffix: 'лошадиных сил',
            template: '/templates/fields/text.html'
        },
        price: {
            required: true,
            type: String,
            enum: [
                'до 500 тыс',
                'от 500 тыс – 1 млн',
                'от 1 млн – 1,5 млн',
                'от 1,5 млн – 2 млн',
                'от 2 млн'
            ],
            label: 'Стоимость авто',
            template: '/templates/fields/select.html'
        },
        city: {
            required: true,
            type: String,
            enum: [
                'Москва и МО',
                'Спб',
                'Екатеринбург',
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
            required: true,
            type: String,
            label: 'Количество водителей',
            enum: ["1", "2", "3", "Неограниченно"],
            template: '/templates/fields/select.html'
        },
        type: {
            required: true,
            type: [String],
            enum: ['КАСКО', 'ОСАГО', 'ДАГО (расширение ОСАГО)'],
            label: 'Что считаем?',
            template: '/templates/fields/multiselect.html'
        },
        franchise: {
            required: true,
            type: String,
            enum: ['Да', 'Нет', 'Возможно'],
            label: 'Франшиза',
            template: '/templates/fields/select.html'
        },
        franchiseSum: {
            type: Number,
            inputAttrs: {
                size: 8
            },
            mask: 'R',
            inputSuffix: 'рублей',
            label: 'Размер франшизы',
            template: '/templates/fields/text.html'
        },
        fullName: {
            required: true,
            type: String,
            inputAttrs: {
                size: 50
            },
            label: 'Полное имя',
            template: '/templates/fields/text.html',
            mask: 'n n',
            required: true
        },
        phoneNumber: {
            required: true,
            type: String,
            inputAttrs: {
                size: 20,
                minLength: 9,
                maxLength: 20,
                placeholder: '+7',
                includePlaceholder: 'true'
            },
            mask: '+9 (999) 999 99 99',
            label: 'Номер телефона',
            template: '/templates/fields/text.html'
        }
    }),
    Driver: new mongoose.Schema({
        gender: {
            required: true,
            type: String,
            enum: ['Муж', 'Жен'],
            template: '/templates/fields/simpleSelect.html'
        },
        age: {
            required: true,
            type: Number,
            mask: '99',
            template: '/templates/fields/simpleInput.html',
            default: 25
        },
        experience: {
            required: true,
            type: Number,
            mask: '99',
            template: '/templates/fields/simpleInput.html',
            default: 2
        }
    }),
    DiscountInfo: new mongoose.Schema({
        feedback: {
            required: true,
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feedback'
        },
        fullName: {
            required: true,
            label: 'Полное имя',
            type: String,
            template: '/templates/fields/splittext.html',
            mask: 'N N N',
            rowClass: 'grid-12',
            inputAttrs: [{
                size: 10, 
                minLength: 9,
                maxLength: 20,
                placeholder: 'Имя'
            },
            {
                size: 10, 
                minLength: 9,
                maxLength: 20,
                placeholder: 'Отчество'
            },
            {
                size: 10, 
                minLength: 9,
                maxLength: 20,
                placeholder: 'Фамилия'
            }]
        },
        birthDate: {
            required: true,
            label: 'Дата рождения',
            type: String,
            template: '/templates/fields/splittext.html',
            mask: 'D M Y',
            rowClass: 'grid-24',
            inputAttrs: [{
                size: 2, 
                minLength: 2,
                maxLength: 2,
                placeholder: 'ДД'
            },
            {
                size: 2, 
                minLength: 2,
                maxLength: 2,
                placeholder: 'ММ'
            },
            {
                size: 4, 
                minLength: 2,
                maxLength: 4,
                placeholder: 'ГГГГ'
            }]
        },
        licenceId: {
            required: true,
            label: 'Водительское удостоверение',
            type: String,
            template: '/templates/fields/splittext.html',
            mask: 'L L',
            rowClass: 'grid-16',
            inputAttrs: [{
                size: 15,
                minLength: 9,
                maxLength: 10,
                placeholder: 'Серия'
            },
            {
                size: 15,
                minLength: 9,
                maxLength: 10,
                placeholder: 'Номер'
            }]
        },
        company: {
            required: true,
            type: String,
            enum: ['Ингос', 'РГС', 'Другая'],
            label: 'В какой страховой заканчивается полис',
            template: '/templates/fields/select.html'
        },
        isNotFirst: {
            required: true,
            type: String,
            label: 'Были ли страховые случаи',
            enum: ['Да', 'Нет'],
            template: '/templates/fields/select.html'
        },
        withConsult: {
            required: true,
            type: String,
            label: 'Нужна консультация',
            enum: ['Да', 'Нет'],
            template: '/templates/fields/select.html'
        },
        tarif: {
            required: true,
            type: String,
            label: 'Какой тариф вам интересен',
            enum: ['Цена/Качество', 'Самый дешевый', 'Самый надежный'],
            template: '/templates/fields/select.html'
        },
        comment: {
            type: String,
            mask: 'S',
            label: 'Комментарий',
            template: '/templates/fields/text.html',
            helpText: '(при желании)',
            placeholder: 'Оставьте ваш комментарий'
        }
    })
};

for( var schemaName in module.exports.schemas ) {
    module.exports.schemas[schemaName].statics.getPathErrorMessage = function portable (pathName, errorKey) {
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
    module.exports.schemas[schemaName].methods.setValidity = function portable (pathName, valid) {
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
}

module.exports.schemas.Feedback.methods.isVisible = function portable ( pathName ) {
    switch(pathName) {
        case 'franchiseSum':
            var schema = this.__proto__.model.schema,
                fEnum = schema.paths.franchise.options.enum,
                fValue = this.franchise;
            return (fEnum.indexOf(fValue) == 0);
        default:
            return true;
    }
}
module.exports.schemas.Feedback.methods.display = function portable ( pathName ) {
    var value = this[pathName],
        path = this.__proto__.model.schema.paths[pathName],
        index = -1;
    if( path.options.enum ) {
        index = path.options.enum.indexOf(value);
    }
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
            return ( ( index == 0) || ( index == 2 ) ) ? 'Франшиза' : '';
        case 'franchiseSum':
            return value + ' руб';
        case 'driversCount':
            return value + ( ( index == 0 ) ? " водитель" : ( ( index == 3 ) ? "" : " водителя" ) );
        case 'type':
            if( typeof( value ) == 'object' && value.length ) {
                return value.map( function ( v ) {
                    return v;
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
};

module.exports.schemas.Feedback.methods.getPathErrorMessage = function portable ( pathName, errKey ) {
    return 'Введите правильное значение';
};
