'use strict';
/**
 * Created by barre on 7/16/2017.
 */

angular.module('sweetLeads.policy', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
//        console.log(authorizedService);
    $routeProvider.when('/policy', {
      templateUrl: 'policy/policy.html',
      controller: 'policyCtrl',


    });
  }])

  .controller('policyCtrl', [function() {

  }]);