'use strict';

angular.module('sweetLeads.register', ['ngRoute','angularjs-datetime-picker'])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/register', {
            templateUrl: 'register/register.html',
            controller: 'registerCtrl'
        });
    }])

    .controller('registerCtrl', ['$window','$scope','loginService','$rootScope',function($window,$scope,loginService,$rootScope) {
        let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
        $scope.states = $rootScope.states;
        $scope.saveErrorMessage = "";
        $scope.emailAddress = "";
        $scope.password = "";
        $scope.passwordConfirm = "";
        $scope.state = "";
        $scope.city = "";
        $scope.zipcode = "";
        $scope.address = "";
        $scope.affiliation = "";
        $scope.submitted = false;
        $scope.registerSubmit = function() {
            $scope.showAlert = false;
            if ($scope.password.length < 8 || !strongRegex.test($scope.password)) {
              $scope.showAlert = true;
              $scope.alertMessage = "Passwords must be greater than 8 characters with 1 number, 1 uppercase character, 1 lowercase character, and one special character.";
            } else if ($scope.password !== $scope.passwordConfirm) {
              $scope.showAlert = true;
              $scope.alertMessage = "Your confirmed password must match the password you entered.";
            } else {
              loginService.register({
                  password: $scope.password,
                  emailAddress: $scope.emailAddress,
                  state: $scope.state,
                  city: $scope.city,
                  zipcode: $scope.zipcode,
                  affiliation: $scope.affiliation,
                  address: $scope.address,
                  termsOfService : $scope.termsOfService
              }).then(res => {
                  if(res.status === "error") {
                      $scope.showAlert = true;
                      $scope.alertMessage = res.message;
                  } else {
                      $scope.submitted =  true;
                      $scope.showAlert = false;
                  }
              }).catch(err => {
                  console.error(err);
              });
            }
        };

        $scope.dismissAlert = function() {
            $scope.showAlert = false;
        }
    }]);
