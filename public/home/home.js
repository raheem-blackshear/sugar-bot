'use strict';
/**
 * Created by barre on 7/16/2017.
 */

angular.module('sweetLeads.home', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/home', {
            templateUrl: 'home/home.html',
            controller: 'homeCtrl'
        });
    }])

    .controller('homeCtrl', [function() {

    }]);