'use strict';
/**
 * Created by barre on 7/16/2017.
 */

angular.module('sweetLeads.termsOfUse', ['ngRoute'])

  .config(['$routeProvider', function($routeProvider) {
//        console.log(authorizedService);
    $routeProvider.when('/termsOfUse', {
      templateUrl: 'termsOfUse/termsOfUse.html',
      controller: 'termsOfUseCtrl'

    });
  }])

  .controller('termsOfUseCtrl', [function() {

  }]);
