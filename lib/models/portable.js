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
            template: '/calcute/templates/fields/generic.html',
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
            template: '/calcute/templates/fields/textbutton.html'
        },
        fullLabel: {
            type: String,
            template: '/calcute/templates/fields/textbutton.html',
            inputAttrs: {
                placeholder: 'Введите название модели',
                autoFocus: true
            }
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CarBrand',
            template: '/calcute/templates/fields/complex/carbrand.html'
        },
        isDraft: {
            type: Boolean,
            default: true
        },
    }),
    Feedback: new mongoose.Schema({
        car: {
            label: 'Автомобиль',
            ref: 'Car',
            template: '/calcute/templates/fields/complex/car.html',
            type: mongoose.Schema.Types.ObjectId
        },
        year: {
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
            errorText: 'Выберите один из вариантов',
            helpText: 'Год выпуска вашего авто по ПТС',
            label: 'Год выпуска',
            required: true,
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        power: {
            errorText: 'Введите число л.с. от 1-999',
            helpText: 'Кол-во лошадиных сил вашего авто по ПТС',
            inputAttrs: {
                autoFocus: true,
                size: 4
            },
            label: 'Двигатель, л.с.',
            mask: 'C',
            required: true,
            template: '/calcute/templates/fields/text.html',
            type: String
        },
        capacity: {
            errorText: 'Введите объем двигателя от 0,1 до 9,9 л',
            helpText: 'Объем двигателя вашего авто по ПТС',
            inputAttrs: {
                autoFocus: true,
                size: 4
            },
            label: 'Объем двигателя',
            mask: '9,9',
            required: true,
            template: '/calcute/templates/fields/text.html',
            type: String
        },
        price: {
            enum: [
                'до 500 тыс',
                'от 500 тыс – 1 млн',
                'от 1 млн – 1,5 млн',
                'от 1,5 млн – 2 млн',
                'от 2 млн'
            ],
            errorText: 'Выберите один из вариантов',
            helpText: 'Укажите рыночную стоимость вашго авто',
            label: 'Стоимость авто',
            required: true,
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        credit: {
            enum: ["Кредитное", "Не кредитное"],
            errorText: 'Выберите один из вариантов',
            helpText: 'У вас еще есть кредитные обязатльства',
            label: 'Авто кредитное?',
            required: true,
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        bank: {
            enum: ["Сбербанк России", "Совкомбанк", "Газпромбанк", "Бинбанк", 
                   "Россельхозбанк", "ВТБ 24", "Промсвязьбанк", "Рост банк",
                   "СМП банк", "Югра", "Ханты-Мансийский банк", "Открытие", 
                   "Россия", "Центр-инвест", "Московский индустриальный банк", 
                   "Таврический", "Авангард", "РГС банк", "Транскапиталбанк",
                   "Тинькофф банк", "Московский кредитный банк", "Другой"],
            errorText: 'Если вашего банка нет, выберите "другой"',
            helpText: 'Выбирите банк, выдавший вам кредит',
            label: 'Банк',
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        city: {
            enum: ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург",  "Казань",
                   "Нижний Новгород", "Челябинск", "Омск", "Самара", "Ростов-на-Дону",
                   "Красноярск", "Уфа", "Пермь", "Воронеж", "Другой"],
            errorText: 'Если вашего города нет, выберите "другой"',
            helpText: 'Укажите город, в котором вы зарегистрированы',
            label: 'Город',
            required: true,
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        drivers: {
            countLabels: [[1, '1'], [2, '2'], [3, '3'], [0, 'Неограниченно']],
            errorText: 'Укажите возраст и стаж самого неопытного водителя',
            helpText: 'Укажите количество, пол, возраст и стаж водителей, допущенных к управлению авто',
            label: 'Водители',
            template: '/calcute/templates/fields/complex/drivers.html',
            type: [{
                ref: 'Driver',
                type: mongoose.Schema.Types.ObjectId
            }],
            validate: driversValidate
        },
        type: {
            enum: ['КАСКО', 'ОСАГО', 'ДАГО (расширение ОСАГО)'],
            errorText: 'Выберите один или несколько из вариантов', 
            helpText: 'Выбирите страховые продукты для рассчета',
            label: 'Что считаем?',
            required: true,
            template: '/calcute/templates/fields/multiselect.html',
            type: [String]
        },
        franchise: {
            enum: ['Да', 'Нет', 'Возможно'],
            errorText: 'Если не уверены, нажмите "возможно", и мы сделаем несколько расчетов',
            helpText: 'Позволяет уменьшить стоимость полиса за счет неполной компенсации ущерба',
            label: 'Франшиза',
            required: true,
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        franchiseSum: {
            errorText: 'Комфортной суммой франшизы считается 10-15 тыс. рублей',
            helpText: 'Определенная сумма ущерба по КАСКО, которую вы готовы возмещать самостоятельно',
            inputAttrs: {
                autoFocus: true,
                size: 8
            },
            inputSuffix: 'рублей',
            label: 'Размер франшизы',
            mask: 'R',
            template: '/calcute/templates/fields/text.html',
            type: Number
        },
        fullName: {
            errorText: 'Укажите ваше имя',
            helpText: 'Поможет определить вашу страховую историю',
            inputAttrs: {
                autoFocus: true,
                size: 50
            },
            label: 'Полное имя',
            mask: 'n n n',
            required: true,
            template: '/calcute/templates/fields/text.html',
            type: String
        },
        phoneNumber: {
            errorText: 'Введите корректный контактный телефон',
            helpText: 'Корректная контактная информация гарантирует скидку на страховой полис',
            inputAttrs: {
                autoFocus: true,
                size: 20,
                minLength: 9,
                maxLength: 20,
                placeholder: '+7',
                includePlaceholder: 'true'
            },
            label: 'Номер телефона',
            mask: '+9 (999) 999 99 99',
            required: true,
            template: '/calcute/templates/fields/text.html',
            type: String
        },
        emitted: {
            default: false,
            type: Boolean
        }
    },
    {
        timestamps: true
    }),
    DiscountInfo: new mongoose.Schema({
        feedback: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Feedback',
            required: true
        },
        expYear: {
            enum: (function() {
                var arr = [];
                for(var i = 0; i < 17; i++) {
                    if(i == 16) {
                        arr.push('2000 и раньше');
                    }
                    else {
                        arr.push((2016 - i).toString());
                    }
                }
                return arr;
            })(),
            errorText: "Выбирите один из вариантов",
            helpText: "Выберите год в которым вы начали упралять ТС",
            label: 'Год начала эксплуатации',
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        expMonth: {
            enum: ['Январь', 'Февраль', 'Март',
                   'Апрель', 'Май', 'Июнь',
                   'Июль', 'Август', 'Сентябрь',
                   'Октябрь', 'Ноябрь', 'Декабрь'],
            label: 'Месяц начала эксплуатации',
            errorText: "Выбирите один из вариантов",
            helpText: "Выберите месяц, в которым вы начали упралять ТС",
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        company: {
            errorText: "Если полиса не было, не отвечайте на этот вопрос",
            helpText: "Выбирите страховую компанию, в который у вас заканчивается полис",
            label: 'В какой страховой заканчивается полис',
            ref: 'Company',
            template: '/calcute/templates/fields/refselect.html',
            type: mongoose.Schema.Types.ObjectId
        },
        isNotFirst: {
            enum: ['Да', 'Нет'],
            errorText: "Выбирите один из вариантов",
            helpText: "Обращались ли в страховую компанию за прошлый страховой период?",
            label: 'Были ли страховые случаи',
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        isMarried: {
            enum: ['Да', 'Нет'],
            errorText: "Выбирите один из вариантов",
            helpText: "Укажите ваше семейное положение в настоящее время",
            label: 'Состоите ли вы в браке?',
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        hasKids: {
            enum: ['Да', 'Нет'],
            errorText: "Выбирите один из вариантов",
            helpText: "Если у вас дети возрастом 14 лет включительно",
            label: 'Есть ли дети до 14 лет?',
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        mileage: {
            errorText: "Введите примерное число",
            helpText: "Укажите примерный пробег вашего автомобиля",
            inputAttrs: {
                size: 5
            },
            label: 'Пробег',
            mask: 'Z',
            template: '/calcute/templates/fields/text.html',
            type: String
        },
        serviceGuarantee: {
            enum: ['Да', 'Нет'],
            errorText: "Выбирите один из вариантов",
            helpText: "На сегодняшний день автомобиль находится на официальной гарантии",
            label: 'ТС на гарантии?',
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        prolongation: {
            enum: ['КАСКО', 'ОСАГО'],
            errorText: "Оставьте поле пустое, если не уверены в ответе",
            helpText: "Выберите полисы, которые хотите пролонгировать",
            label: 'Пролонгация?',
            template: '/calcute/templates/fields/multiselect.html',
            type: [String]
        },
        lastPolicy: {
            type: String,
            label: 'Серия и номер прошлого полиса ОСАГО',
            mask: 'www dddddddddd',
            template: '/calcute/templates/fields/text.html',
            inputAttrs: {
                size: 18
            }
        },
        theftProtection: {
            enum: ['Штатная сигнализация', 'Спутниковая', 'Механическая'],
            errorText: "Выбирите один или несколько вариантов",
            helpText: "Укажите системы, которые установлены на вашем авто",
            label: 'Защита от угона',
            template: '/calcute/templates/fields/multiselect.html',
            type: [String]
        },
        autoStarter: {
            enum: ['Да', 'Нет'],
            errorText: "Выбирите один из вариантов",
            helpText: "Укажите, если ваш авто можно завести дистанционно",
            label: 'Система автозапуска',
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        withConsult: {
            enum: ['Да', 'Нет'],
            errorText: "Выбирите один из вариантов",
            helpText: "Укажите, если вам нужна бесплатная консультация помощь специалиста",
            label: 'Нужна консультация',
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        tarif: {
            enum: ['Цена/Качество', 'Самый дешевый', 'Самый надежный'],
            errorText: "Выбирите один из вариантов",
            helpText: "Укажите ваши приоритеты в выборе страхового продукта",
            label: 'Какой тариф вам интересен',
            template: '/calcute/templates/fields/select.html',
            type: String
        },
        birthDate: {
            errorText: "Укажите корректную дату вашего рождения",
            helpText: "Укажите дату вашего рождения в формате ДД/ММ/ГГ",
            inputAttrs: {
                size: 12, 
                placeholder: "ДД.ММ.ГГГГ"
            },
            label: 'Дата рождения',
            mask: 'D.M.Y',
            rowClass: 'grid-24',
            template: '/calcute/templates/fields/text.html',
            type: String
        },
        fullName: {
            errorText: "Укажите корректное имя в формате Ф И О",
            helpText: "Укажите ваше полное имя в формате Ф И О",
            inputAttrs: {
                autoFocus: true,
                placeholder: "Фамилия Имя Отчество",
                size: 50
            },
            label: 'Полное имя',
            mask: 'n n n',
            rowClass: 'grid-12',
            template: '/calcute/templates/fields/text.html',
            type: String
        },
        email: {
            errorText: "Укажите корректный адрес электронный почты, чтобы получить копию расчета",
            helpText: "Укажите адрес электронной почты для копии расчета",
            label: 'Адрес электронной почты',
            mask: 'u@t.N',
            template: '/calcute/templates/fields/text.html',
            type: String
        },
        comment: {
            errorText: "Например \"Звонить после 18 часов\", или \"отправить расчет на электронную почту\"",
            helpText: "Укажите дополнительную информацию, или комментарий для специалиста",
            inputAttrs: {
                size: 50
            },
            label: 'Комментарий',
            mask: 't',
            placeholder: 'Оставьте ваш комментарий',
            template: '/calcute/templates/fields/text.html',
            type: String
        },
        drivers: {
            type: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Driver'
            }],
            label: 'Лиценции',
            template: '/calcute/templates/fields/complex/licences.html',
            validate: driversValidate
        }
    }),
    Driver: new mongoose.Schema({
        gender: {
            required: true,
            type: String,
            label: "Пол",
            enum: ['Муж', 'Жен'],
            default: 'Муж',
            template: '/calcute/templates/fields/generic/select.html'
        },
        age: {
            inputAttrs: {
                size: 2
            },
            required: true,
            type: String,
            label: "Возраст",
            mask: '99',
            template: '/calcute/templates/fields/generic/text.html',
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
            template: '/calcute/templates/fields/generic/text.html',
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
            template: '/calcute/templates/fields/generic/text.html',
            inputAttrs: {
                size: 11,
                placeholder: 'Серия Номер'
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
        case 'power':
            if(value){
                return value + ' л.';
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
