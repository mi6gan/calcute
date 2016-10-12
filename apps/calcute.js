'use strict';
(function load() {
    var angular = require('angular');
    var settings = require('settings');
    var directives = {
        'screen': require('../lib/directives/screen.js'),
        'screens': require('../lib/directives/screens.js'),
        'array': require('../lib/directives/array.js'),
        'rowArray': require('../lib/directives/row-array.js'),
        'ngImg': require('../lib/directives/ng-img.js'),
        'ngForm': require('../lib/directives/ng-form.js'),
        'ngModel': require('../lib/directives/ng-model.js'),
        'ngModelSet': require('../lib/directives/ng-model-set.js'),
        'input': require('../lib/directives/input.js')
    };
    var modules = [
        require('../lib/modules/models.js')
    ];
    var extModules = {
        'ngMessages': require('angular-messages'),
        'ngResource': require('angular-resource'),
        'ngRoute': require('angular-route'),
        'ngAnimate': require('angular-animate')
    };
    var app = angular.module('Calcute', Object.keys(extModules));
    angular.forEach(modules, function(module){
        module(this);
    }, app);
    angular.forEach(directives, function(directive, name){
        this.directive(name, directive);
    }, app);
    app.config(function($httpProvider){
        $httpProvider.interceptors.push(function($q){
            return {request: function(config){
                if(config.url&&config.url.length&&config.url[0]=='/'){
                    config.url = settings.SERVICE_URL + config.url;
                }
                return config;
            }};
        });
    });
    app.controller('KKController', function($scope, $timeout, Feedback, Car, CarBrand, DiscountInfo){
        var car = undefined;
        $scope.$watch('initialCar', function(newCar){
            if(newCar){
                car = newCar;
                $scope.reInitAll(true);
            }
        });
        /*
        $scope.$watch('initialBrandLabel', function(newLabel){
            if(newLabel){
                CarBrand.query({label: newLabel}, function(brands){
                    console.log(brands);
                });
            }
        });*/
        $scope.reInitAll = function(formExists){
            $scope.discountForm = false;
            $scope.feedbackForm = Boolean(formExists);
            $scope.discountInfo = new DiscountInfo();
            $scope.feedback = new Feedback({car: car});
        };
        if(settings.DEBUG){
          $scope.feedback = new Feedback({
            car: { fullLabel: 'Custom Car' },
            year: Feedback.prototype.schema.paths.year.options.enum[0],
            capacity: 213,
            price: Feedback.prototype.schema.paths.price.options.enum[0],
            credit: Feedback.prototype.schema.paths.credit.options.enum[0],
            city: Feedback.prototype.schema.paths.city.options.enum[0],
            drivers: [],
            bank: Feedback.prototype.schema.paths.bank.options.enum[0],
            type: [Feedback.prototype.schema.paths.type.options.enum[0]],
            franchise: Feedback.prototype.schema.paths.franchise.options.enum[0],
            franchiseSum: 1000,
            fullName: "ewrwe ewrwer",
            phoneNumber: "+7 (342) 342 34 23"
          });
          $scope.discountInfo = new DiscountInfo({
            birthDate: '5.11.2017',
            drivers: [],
            isNotFirst: DiscountInfo.prototype.schema.paths.isNotFirst.options.enum[0],
            withConsult: DiscountInfo.prototype.schema.paths.withConsult.options.enum[0],
            tarif: DiscountInfo.prototype.schema.paths.tarif.options.enum[0]
          });
          $scope.feedbackForm = true;
        }
        else {
            $scope.reInitAll();
        }
    });
})();
