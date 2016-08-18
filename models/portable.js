var mongoose = require('mongoose');

module.exports.schemas = {
    CarBrand: new mongoose.Schema({
        icon: String,
        label: {
            type: String,
            template: '/templates/fields/textbutton.html'
        }
    }),
    Car: new mongoose.Schema({
        label: {
            type: String,
            template: '/templates/fields/textbutton.html'
        },
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
        credit: {
            required: true,
            type: String,
            enum: ["Кредитное", "Не кредитное"],
            label: 'Авто кредитное?',
            template: '/templates/fields/select.html'
        },
        bank: {
            required: true,
            type: String,
            enum: ["Сбербанк России", "Совкомбанк", "Газпромбанк", "Бинбанк", 
                   "Россельхозбанк", "ВТБ 24", "Промсвязьбанк", "Рост банк",
                   "СМП банк", "Югра", "Ханты-Мансийский банк", "Открытие", 
                   "Россия", "Центр-инвест", "Московский индустриальный банк", 
                   "Таврический", "Авангард", "РГС банк", "Транскапиталбанк",
                   "Тинькофф банк", "Московский кредитный банк"],
            label: 'Банк',
            template: '/templates/fields/select.html'
        },
        city: {
            required: true,
            type: String,
            enum: ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург",  "Казань",
                   "Нижний Новгород", "Челябинск", "Омск", "Самара", "Ростов-на-Дону",
                   "Красноярск", "Уфа", "Пермь", "Воронеж", "Другой"],
            label: 'Город',
            template: '/templates/fields/select.html'
        },
        drivers: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Driver'
            }],
            label: 'Водители',
            countLabels: [[1, '1'], [2, '2'], [3, '3'], [0, 'Неограниченно']],
            template: '/templates/fields/complex/drivers.html'
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
            label: "Пол",
            enum: ['Муж', 'Жен'],
            default: 'Муж',
            template: '/templates/fields/generic/select.html'
        },
        age: {
            required: true,
            type: Number,
            label: "Возраст",
            mask: '99',
            template: '/templates/fields/generic/text.html'
        },
        experience: {
            required: true,
            type: Number,
            label: "Стаж",
            mask: '99',
            template: '/templates/fields/generic/text.html'
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
            template: '/templates/fields/text.html',
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
            template: '/templates/fields/text.html',
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
            template: '/templates/fields/text.html',
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
            required: false,
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
        case 'bank':
            var schema = this.__proto__.model.schema,
                cEnum = schema.paths.credit.options.enum,
                cValue = this.credit;
            return (cEnum.indexOf(cValue) == 0);
        default:
            return true;
    }
}

module.exports.schemas.Driver.methods.display = function portable ( pathName ) {
    var value = this[pathName],
        path = this.__proto__.model.schema.paths[pathName];
    if(undefined !== value) {
        var n = parseInt(value),
            plural = (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n %10<=4 && (n%100<10 || n%100>=20) ? 1 : 2),
            years = ['год', 'года', 'лет'];
        return (path.options.label + ' ' + n + ' ' + years[plural]);
    }
    return;
};

// next shitty display methods are need to be refactored somehow but I don't give a fuck for awhile
module.exports.schemas.DiscountInfo.methods.display = function portable ( pathName ) {
    var value = this[pathName],
        path = this.__proto__.model.schema.paths[pathName],
        index = -1;
    if( path.options.enum ) {
        index = path.options.enum.indexOf(value);
    }
    /*
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
    }*/
    return (typeof( value ) == 'object') ? value.label : String( value );
};
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
            return ( ( index == 0) || ( index == 2 ) ) ? 'Франшиза' : 'Без франшизы';
        case 'franchiseSum':
            return value + ' руб';
        case 'drivers':
            var count = (typeof(value) == 'object') ? value.length : 0;
            if(count) {
                return count + ((count == 1) ? " водитель" : " водителя");
            }
            else {
                return 'Без ограничений';
            }
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
    switch( pathName ) {
        case 'drivers':
            return 'Заполните все поля (эти сообщения улучшим перед релизом, пока не стал убивать на это время)'; 
    }    
    return 'Введите правильное значение';
};
module.exports.schemas.Driver.methods.getPathErrorMessage = function portable ( pathName, errKey ) {
    return 'Заполните все поля';
};
module.exports.schemas.Car.methods.getPathErrorMessage = function portable ( pathName, errKey ) {
    return 'Введите правильное значение';
};
module.exports.schemas.CarBrand.methods.getPathErrorMessage = function portable ( pathName, errKey ) {
    return 'Введите правильное значение';
};
