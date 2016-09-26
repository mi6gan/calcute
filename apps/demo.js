'use strict';
(function load() {
    var angular = require('angular');
    var settings = require('settings');
    var directives = [
        require('../lib/directives/screen.js'),
        require('../lib/directives/screens.js'),
        require('../lib/directives/array.js'),
        require('../lib/directives/row-array.js'),
        require('../lib/directives/ng-form.js'),
        require('../lib/directives/ng-model.js'),
        require('../lib/directives/ng-model-set.js'),
        require('../lib/directives/input.js')
    ];
    var modules = [
        require('../lib/modules/models.js')
    ];
    var extModules = {
        'ngMessages': require('angular-messages'),
        'ngResource': require('angular-resource'),
        'ngRoute': require('angular-route'),
        'ngAnimate': require('angular-animate')
    };
    var app = angular.module('appDemo', Object.keys(extModules));
    angular.forEach(modules, function(module){
        module(this);
    }, app);
    angular.forEach(directives, function(directive){
        this.directive(directive.name, directive);
    }, app);
    app.controller('KKController', function($scope, $timeout, Feedback, Car, CarBrand, DiscountInfo){
        /*
        $scope.$watch( 'feedback.car', function (newVal, oldVal, scope) {
            if( newVal && typeof(newVal) != 'object' ) {
                $scope.feedback.car.brand = CarBrand.get({id: newVal});
            }
        });
        */
        /*
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
        /*
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
