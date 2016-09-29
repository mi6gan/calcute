var mongoose = require('mongoose');

(function initModule() {
  var driversValidate = [{
    validator: function(v) {
        return (v instanceof Array);
    },
    type: 'required',
    msg: 'Выберите количество водителей'
  },
  {
    validator: function(v) {
        if(v instanceof Array){
            for(var i=0; i<v.length; i++){
                if((typeof(v[i])=='object')&&('validateSync' in v[i])){
                    if(!v[i]._id&&!v[i].validateSync()){return false;}
                }
            }
        }
        return true;
    },
    type: 'driver',
    msg: 'Не все данные введены корректно'
  }];
  this.schemas = {
    CarBrand: new mongoose.Schema({
        icon: String,
        isDraft: {
            type: Boolean,
            default: true
        },
        label: {
            type: String,
            template: '/core/templates/fields/generic.html',
            required: true,
            inputAttrs: {
                placeholder: 'Введите название марки',
                autoFocus: true
            },
        }
    }),
    Car: new mongoose.Schema({
        label: {
            type: String,
            template: '/core/templates/fields/textbutton.html'
        },
        fullLabel: {
            type: String,
            template: '/core/templates/fields/textbutton.html',
            inputAttrs: {
                placeholder: 'Введите название модели',
                autoFocus: true
            }
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CarBrand',
            template: '/core/templates/fields/complex/carbrand.html'
        },
        isDraft: {
            type: Boolean,
            default: true
        },
    }),
    Feedback: new mongoose.Schema({
        car: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Car',
            label: 'Автомобиль',
            template: '/core/templates/fields/complex/car.html'
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
            template: '/core/templates/fields/select.html'
        },
        capacity: {
            required: true,
            type: String,
            min: 1,
            max: 1000,
            label: 'Двигатель, л.с.',
            helpText: 'Если не помните точное число, укажите примерное',
            inputAttrs: {
                autoFocus: true,
                size: 4
            },
            mask: 'C',
            template: '/core/templates/fields/text.html'
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
            template: '/core/templates/fields/select.html'
        },
        credit: {
            required: true,
            type: String,
            enum: ["Кредитное", "Не кредитное"],
            label: 'Авто кредитное?',
            template: '/core/templates/fields/select.html'
        },
        bank: {
            type: String,
            enum: ["Сбербанк России", "Совкомбанк", "Газпромбанк", "Бинбанк", 
                   "Россельхозбанк", "ВТБ 24", "Промсвязьбанк", "Рост банк",
                   "СМП банк", "Югра", "Ханты-Мансийский банк", "Открытие", 
                   "Россия", "Центр-инвест", "Московский индустриальный банк", 
                   "Таврический", "Авангард", "РГС банк", "Транскапиталбанк",
                   "Тинькофф банк", "Московский кредитный банк", "Другой"],
            label: 'Банк',
            template: '/core/templates/fields/select.html'
        },
        city: {
            required: true,
            type: String,
            enum: ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург",  "Казань",
                   "Нижний Новгород", "Челябинск", "Омск", "Самара", "Ростов-на-Дону",
                   "Красноярск", "Уфа", "Пермь", "Воронеж", "Другой"],
            label: 'Город',
            template: '/core/templates/fields/select.html'
        },
        drivers: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Driver'
            }],
            label: 'Водители',
            countLabels: [[1, '1'], [2, '2'], [3, '3'], [0, 'Неограниченно']],
            template: '/core/templates/fields/complex/drivers.html',
            validate: driversValidate
        },
        type: {
            required: true,
            type: [String],
            enum: ['КАСКО', 'ОСАГО', 'ДАГО (расширение ОСАГО)'],
            label: 'Что считаем?',
            template: '/core/templates/fields/multiselect.html'
        },
        franchise: {
            required: true,
            type: String,
            enum: ['Да', 'Нет', 'Возможно'],
            label: 'Франшиза',
            template: '/core/templates/fields/select.html'
        },
        franchiseSum: {
            type: Number,
            inputAttrs: {
                autoFocus: true,
                size: 8
            },
            mask: 'R',
            inputSuffix: 'рублей',
            label: 'Размер франшизы',
            template: '/core/templates/fields/text.html'
        },
        fullName: {
            required: true,
            type: String,
            inputAttrs: {
                autoFocus: true,
                size: 50
            },
            label: 'Полное имя',
            template: '/core/templates/fields/text.html',
            mask: 'n n n',
            required: true
        },
        phoneNumber: {
            required: true,
            type: String,
            inputAttrs: {
                autoFocus: true,
                size: 20,
                minLength: 9,
                maxLength: 20,
                placeholder: '+7',
                includePlaceholder: 'true'
            },
            mask: '+9 (999) 999 99 99',
            label: 'Номер телефона',
            template: '/core/templates/fields/text.html'
        }
    }),
    Driver: new mongoose.Schema({
        gender: {
            required: true,
            type: String,
            label: "Пол",
            enum: ['Муж', 'Жен'],
            default: 'Муж',
            template: '/core/templates/fields/generic/select.html'
        },
        age: {
            inputAttrs: {
                size: 2
            },
            required: true,
            type: String,
            label: "Возраст",
            mask: '99',
            template: '/core/templates/fields/generic/text.html',
            validate: [
                function (v) {
                    var val = parseInt(v); 
                    return Boolean(val>=18);
                },
                'Возраст не может быть меньше 18 лет',
                'tooSmall'
            ]
        },
        experience: {
            inputAttrs: {
                size: 2
            },
            required: true,
            type: String,
            label: "Стаж",
            mask: 'D',
            template: '/core/templates/fields/generic/text.html',
            validate: [
                function (v) {
                    var val = parseInt(v); 
                    if(this.age) {
                        return Boolean((this.age-val)>=18);
                    }
                    return true;
                },
                'Введенный стаж не соответствует возрасту',
                'notFits'
            ]
        },
        licence: {
            type: String,
            mask: 'dddd dddddd',
            template: '/core/templates/fields/generic/text.html',
            inputAttrs: {
                size: 11,
                placeholder: 'Серия Номер'
            },
        }
    }),
    DiscountInfo: new mongoose.Schema({
        feedback: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feedback'
        },
        fullName: {
            label: 'Полное имя',
            type: String,
            template: '/core/templates/fields/text.html',
            mask: 'n n n',
            rowClass: 'grid-12',
            inputAttrs: {
                autoFocus: true,
                placeholder: "Фамилия Имя Отчество",
                size: 50
            }
        },
        birthDate: {
            label: 'Дата рождения',
            type: String,
            template: '/core/templates/fields/text.html',
            mask: 'D.M.Y',
            rowClass: 'grid-24',
            inputAttrs: {
                size: 8, 
                placeholder: "ДД.ММ.ГГГГ"
            }
        },
        drivers: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Driver'
            }],
            label: 'Лиценции',
            template: '/core/templates/fields/complex/licences.html',
            validate: driversValidate
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            label: 'В какой страховой заканчивается полис',
            template: '/core/templates/fields/refselect.html'
        },
        isNotFirst: {
            type: String,
            label: 'Были ли страховые случаи',
            enum: ['Да', 'Нет'],
            template: '/core/templates/fields/select.html'
        },
        withConsult: {
            type: String,
            label: 'Нужна консультация',
            enum: ['Да', 'Нет'],
            template: '/core/templates/fields/select.html'
        },
        tarif: {
            type: String,
            label: 'Какой тариф вам интересен',
            enum: ['Цена/Качество', 'Самый дешевый', 'Самый надежный'],
            template: '/core/templates/fields/select.html'
        },
        comment: {
            type: String,
            mask: 't',
            label: 'Комментарий',
            template: '/core/templates/fields/text.html',
            helpText: '(при желании)',
            placeholder: 'Оставьте ваш комментарий',
            inputAttrs: {
                size: 50
            }
        }
    }),
    Company: new mongoose.Schema({
        title: {
            required: true,
            type: String
        }
    })
  };

  this.schemas.DiscountInfo.post('init', function(doc) {
      console.log(doc);
  });

  for( var schemaName in this.schemas ) {
    this.schemas[schemaName].statics.getPathErrorMessage = function portable (pathName, errorKey) {
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
    this.schemas[schemaName].methods.setValidity = function portable (pathName, valid) {
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

  this.schemas.Feedback.methods.isVisible = function portable ( pathName ) {
    switch(pathName) {
        case 'franchiseSum':
            var schema = this.schema,
                fEnum = schema.paths.franchise.options.enum,
                fValue = this.franchise;
            return (fEnum.indexOf(fValue) == 0);
        case 'bank':
            var schema = this.schema,
                cEnum = schema.paths.credit.options.enum,
                cValue = this.credit;
            return (cEnum.indexOf(cValue) == 0);
        default:
            return true;
    }
  }

  this.schemas.DiscountInfo.methods.isVisible = function portable ( pathName ) {
    switch(pathName) {
        case 'drivers':
            var value = this.drivers;
            return value instanceof Object && value.length;
        default:
            return true;
    }
  }

  this.schemas.Driver.methods.display = function portable ( pathName, value ) {
    var path = this.schema.paths[pathName];
    switch( pathName ) {
        case 'age':
        case 'experience':
            var n = parseInt(value),
                plural = (n%10==1 && n%100!=11 ? 0 : n%10>=2 && n %10<=4 && (n%100<10 || n%100>=20) ? 1 : 2),
                years = ['год', 'года', 'лет'];
        //return (path.options.label + ' ' + n + ' ' + years[plural]);
            return (n + ' ' + years[plural]);
    }
    return value;
  };

  // next shitty display methods are need to be refactored somehow but I don't give a fuck for awhile
  this.schemas.DiscountInfo.methods.display = function portable ( pathName, value ) {
    var path = this.schema.paths[pathName],
        index = -1;
    if( path.options.enum ) {
        index = path.options.enum.indexOf(value);
    }
    switch( pathName ) {
        case 'company':
            if ( ( typeof(value) == 'object' ) && ( 'title' in value ) ) {
                return value.title;
            }
        case 'comment':
            if( typeof(value) == 'string' ) {
                var sliced = value.slice(0, 20);
                return (sliced + ((sliced.length<value.length) ? '...' : '')); 
            }
        case 'fullName':
            if( typeof(value) == 'string' ) {
                var parts = value.split(' ');
                if(parts.length) {
                    var out = parts[0];
                    if(parts.length>1) {
                        out += (" " + parts[1].slice(0, 1) + ( parts[1].length>1 ? '.' : '' ));
                    }
                    if(parts.length>2) {
                        out += (" " + parts[2].slice(0, 1) + ( parts[2].length>1 ? '.' : '' ));
                    }
                    return out;
                }
            }
        case 'withConsult':
            if(value=='Да') {
                return 'Нужна консультация';
            }
            else if(value=='Нет') {
                return 'Не нужна консультация';
            }
        case 'isNotFirst':
            if(value=='Да') {
                return 'Убытки';
            }
            else if(value=='Нет') {
                return 'Без убытков';
            }
        default:
            if ( ( typeof(value) == 'object' ) && ( 'label' in value ) ) {
                return value.label;
            }
    }
    return (typeof( value ) == 'object') ? value.label : (value ? String( value ) : null);
  };
  this.schemas.Feedback.methods.display = function portable ( pathName, value ) {
    var path = this.schema.paths[pathName],
        index = -1;
    if( path.options.enum ) {
        index = path.options.enum.indexOf(value);
    }
    switch( pathName ) {
        case 'car':
            if( typeof( value ) == 'object' && value.fullLabel) {
                return value.fullLabel;
            }
            else if( typeof( value ) == 'object' && value.label && value.brand) {
                return value.brand.label + ' ' + value.label;
            }
            break;
        case 'capacity':
            if(value){
                return value + ' л.с.';
            }
            else {
                return '';
            }
        case 'franchise':
            return ( ( index == 0) || ( index == 2 ) ) ? 'Франшиза' : 'Без франшизы';
        case 'franchiseSum':
            if(value){
                return value + ' руб.';
            }
            else {
                return '';
            }
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
                return '';
            }
        default:
            if ( ( typeof(value) == 'object' ) && ( 'label' in value ) ) {
                return value.label;
            }
    }
    return (typeof( value ) == 'object') ? value.label : ( value ? String( value ) : '');
  };
  this.schemas.Feedback.methods.getPathErrorMessage = function portable ( pathName, errKey ) {
    switch( pathName ) {
        case 'drivers':
            return 'Заполните все поля (эти сообщения улучшим перед релизом, пока не стал убивать на это время)'; 
    }    
    return 'Введите правильное значение';
  };
  this.schemas.Driver.methods.getPathErrorMessage = function portable ( pathName, errKey ) {
    return 'Заполните все поля';
  };
  this.schemas.Car.methods.getPathErrorMessage = function portable ( pathName, errKey ) {
    return 'Введите правильное значение';
  };
  this.schemas.CarBrand.methods.getPathErrorMessage = function portable ( pathName, errKey ) {
    return 'Введите правильное значение';
  };
}).call(module.exports);
