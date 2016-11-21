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
    app.controller('KKController', function($scope, $document, $timeout, Feedback, Car, CarBrand, DiscountInfo){
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
        function getUtms(){
            var params = $document[0].location.href.split(/(\?#1)|\?/),
                utms = {};
            if(params.length>1){
                decodeURIComponent(params[2]).split('&').forEach(function(sub){
                    var pv = sub.split('=');
                    utms[pv[0]] = [pv[1].replace(/\+/g, ' ')];
                });
            }
            return utms;
        }
        $scope.reInitAll = function(formExists){
            if($scope.discountInfo){
                reachGoal('calc_again');
            }
            $scope.discountForm = false;
            $scope.feedbackForm = Boolean(formExists);
            $scope.discountInfo = new DiscountInfo();
            $scope.feedback = new Feedback({car: car, utms: getUtms()});
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
            utms: getUtms()
          });
          $scope.feedbackForm = true;
        }
        else {
            $scope.reInitAll();
        }
        $scope.$watch('initial', function(initial){
            var utmIds = {
                'YandexDirect': 1,
                'GoogleAdwords': 2,
                'Рекламная сеть Яндекса': 3,
                'Google adsence': 4
            };
            if(initial){
                angular.forEach(initial, function(v, k){
                    switch(k){
                      case 'utms':
                        if (angular.isObject($scope.feedback.utms)){
                            $scope.feedback.utms = Object.assign($scope.feedback.utms, v);
                            break;
                        }
                      default:
                        $scope.feedback[k] = v;
                    }
                });
            }
            if(angular.isObject($scope.feedback.utms){
                var utms = $scope.feedback.utms;
                if(angular.isObject(utms.utm_source)&&utms.utm_source.length){
                    $scope.feedback.utmSource = utms.utm_source[0]; 
                    $scope.feedback.utmSourceId = utmIds[utms.utm_source[0]]; 
                } else if(angular.isObject(utms.keyword)&&utms.keyword.length){
                    $scope.feedback.seoQuery = utms.keyword[0]; 
                } 
            });
            console.log($scope.feedback);
        });
    });
})();
