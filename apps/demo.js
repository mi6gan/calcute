'use strict';
(function load() {
    var angular = require('angular');
    var directives = {
        "array": require('../lib/directives/array.js'),
        "rowArray": require('../lib/directives/row-array.js'),
        "screen": require('../lib/directives/screen.js'),
        "screens": require('../lib/directives/screens.js'),
        //"ngModel": require('../lib/directives/ng-model.js')
    };
    var modules = {
        "models": require('../lib/modules/models.js')
    };
    var extModules = {
        'ngMessages': require('angular-messages'),
        'ngResource': require('angular-resource'),
        'ngRoute': require('angular-route'),
        'ngAnimate': require('angular-animate'),
        'masker': require('../node_modules/angular-masker/src/angular-masker.js')
    };
    var app = angular.module('Demo', Object.keys(extModules));
    app.config(function(MaskerProvider) {
        angular.extend(MaskerProvider.patterns, {
            "N": /[A-za-zА-Яа-я]{1,20}/,
            "n": /[A-za-zА-Яа-я]{0,20}/,
            "C": /\d{1,4}/,
            "R": /\d{1,9}/,
            "L": /\d{1,20}/,
            "S": /[A-za-zА-Яа-я\s]{1,20}/,
            "D": /\d{1,2}/,
            "M": /\d{1,2}/,
            "Y": /\d{1,4}/,
            "d": /\d{1,1}/,
            "t": /[A-za-zА-Яа-я0-9\s]{1,200}/
        });
    });
    for(name in modules){
        modules[name](app);
    }
    for(name in directives){
        app.directive(name, directives[name]);
    }
    app.controller('KaskoCalculator', function($scope, $timeout, Feedback, Car, CarBrand, DiscountInfo){
        $scope.models = {
            Feedback: Feedback,
            CarBrand: CarBrand,
            Car: Car,
            DiscountInfo: DiscountInfo
        };
        function cleanModelInstance(model, instance) {
            angular.forEach( model.schema.paths, function (path, pathName ) {
                var value = instance[pathName];
                if( pathName.length && ( pathName[0] == '_' || pathName[0] == '$' ) ) {
                    delete instance[pathName];
                    return;
                }
                if(angular.isObject(value) && '$$hashKey' in value) {
                    value = angular.merge({}, value);
                    delete value.$$hashKey;
                    instance[pathName] = value; 
                }
                if( path.options.ref ) {
                    if( angular.isObject(value) ) {
                        if( angular.isString( value._id ) ) {
                            instance[pathName] = value._id;
                        }
                        else {
                            delete value._id;
                            var model = $scope.models[path.path],
                                refInstance = new model( value );
                            refInstance.save( function( err, doc ) {
                                $scope.models[path.path] = doc;
                            } );
                        }
                    }
                }
            } );
        }
        $scope.newFeedback = function newFeedback ( defaults ) {
            var instance = new $scope.models.Feedback( defaults );
            for( var pathName in $scope.models.Feedback.schema.paths ) { 
                instance.setValidity( pathName, false );
            }
            //instance.fullName = "ewrwe ewrwer";
            //instance.$submitted = true;
            return instance;
        };
        /*
        $scope.$watch( 'feedback.car', function (newVal, oldVal, scope) {
            if( newVal && typeof(newVal) != 'object' ) {
                $scope.feedback.car.brand = CarBrand.get({id: newVal});
            }
        });
        $scope.$watch( 'feedback.car.label', function (newVal, oldVal, scope) {
            if( newVal ) {
                scope.feedback.setValidity('car', true);
            }
            else if ( scope.feedback ) {
                scope.feedback.setValidity('car', false);
            }
        } );
        */
        //$scope.feedback = $scope.newFeedback();
        //$scope.discountInfo = new DiscountInfo();
        //$scope.feedback.$submitted = true;  
        /*
        $scope.discountInfo = angular.extend(new DiscountInfo(), {
            fullName: 'name name name',
            birthDate: '5.11.2017',
            licenceId: '1234 567890'
        });
        */
        /*
        $scope.feedback = angular.extend(new Feedback(), {
            //car: { brand: {_id: "57238136306c653bf7f6ba87"}, $input: 'brand' },
            year: Feedback.schema.paths.year.options.enum[0],
            capacity: "21312",
            price: Feedback.schema.paths.price.options.enum[0],
            city: Feedback.schema.paths.city.options.enum[0],
            type: [Feedback.schema.paths.type.options.enum[0]],
            franchise: Feedback.schema.paths.franchise.options.enum[0],
            franchiseSum: 1000,
            fullName: "ewrwe ewrwer",
            //phoneNumber: "+7 (342) 342 34 23"
        });
        //$scope.saveFeedback();
        Car.findOne({}, function(err, car) {
            var defaults = {
                car: car,
                year: Feedback.schema.paths.year.options.enum[0],
                capacity: 100,
                price: Feedback.schema.paths.price.options.enum[0],
                city: Feedback.schema.paths.city.options.enum[0],
                driversCount: Feedback.schema.paths.driversCount.options.enum[0],
                type: [Feedback.schema.paths.type.options.enum[0]],
                //type: {},
                franchise: Feedback.schema.paths.franchise.options.enum[0],
                franchiseSum: 1000,
                fullName: 'John Smith',
                phoneNumber: '+7 (123) 456 78 90'
            };
            $scope.feedback = $scope.newFeedback(); 
            for(var pathName in Feedback.schema.paths) {
                var value = Feedback.schema.paths[pathName].defaultValue;
                if(value) {
                    $scope.feedback[pathName] = value;
                }
            }
            angular.forEach( defaults, function( value, pathName ) {
                $scope.feedback[pathName] = value;
                this.setValidity( pathName, true );
            }, $scope.feedback);
        });
        */
    });
})();
