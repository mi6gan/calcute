'use strict';
(function load() {
    var angular = require('angular');
    var settings = require('settings');
    var directives = {
        'screens': require('../lib/directives/screens.js'),
        'screen': require('../lib/directives/screen.js'),
        'ngImg': require('../lib/directives/ng-img.js'),
        'ngForm': require('../lib/directives/ng-form.js'),
        'ngModel': require('../lib/directives/ng-model.js'),
        'ngModelSet': require('../lib/directives/ng-model-set.js'),
        'input': require('../lib/directives/input.js'),
        'query': require('../lib/directives/query.js')
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
        var reachGoal = function(id){
            if(window&&window.yaCounter19745419){
                yaCounter19745419.reachGoal(id);
            }
        };
        $scope.$watch('feedback._id', function(v){
            if(v){
                reachGoal('half_sent');
            }
        });
        $scope.$watch('discountInfo._id', function(v){
            if(v){
                reachGoal('full_sent');
            }
        });
        $scope.startCalc = function(){
            reachGoal('start_calc');
            $scope.feedbackForm = true;
        }
        $scope.reInitAll = function(formExists){
            if($scope.discountInfo){
                reachGoal('calc_again');
            }
            $scope.discountForm = false;
            $scope.feedbackForm = Boolean(formExists);
            $scope.discountInfo = new DiscountInfo();
            $scope.feedback = new Feedback({car: car});
        };
        if(settings.DEBUG){
          $scope.feedback = new Feedback({
            car: { fullLabel: 'Custom Car' },
            year: Feedback.prototype.schema.paths.year.options.enum[0],
            capacity: '12',
            power: '1,2',
            bank: Feedback.prototype.schema.paths.bank.options.enum[0],
            price: Feedback.prototype.schema.paths.price.options.enum[0],
            credit: Feedback.prototype.schema.paths.credit.options.enum[0],
            city: Feedback.prototype.schema.paths.city.options.enum[0],
          });
          $scope.feedbackForm = true;
        }
        else {
            $scope.reInitAll();
        }
    });
})();
