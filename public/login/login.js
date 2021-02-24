'use strict';
/**
 * Created by barre on 7/16/2017.
 */

angular.module('sweetLeads.login', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: '/login/login.html',
            controller: 'loginCtrl'
        });
    }])

    .controller('loginCtrl', ['$scope', 'loginService', '$window', function ($scope, loginService, $window) {
        $scope.emailAddress = "";
        $scope.password = "";
        $scope.passwordResetSelected = false;
        $scope.passwordResetResponse = "";
        $scope.errorMessage = "";
        $scope.savedLogin = false;
        $scope.rememberme = false;
        if($window.sessionStorage['sugarbot_userinfo']) {
          let data = atob($window.sessionStorage['sugarbot_userinfo']).split(":");
          $scope.emailAddress = data[0];
          $scope.password = data[1];
          if($scope.emailAddress && $scope.password)
            $scope.savedLogin = true;
        }

        $scope.loginAsNew = () => {
            $scope.emailAddress = "";
            $scope.password = "";
            $scope.savedLogin = false;
            $window.sessionStorage.removeItem('sugarbot_userinfo');
        }

        $scope.loginSubmit = function () {
            $scope.emailAddress = $scope.emailAddress && !$scope.loginInvalid?$scope.emailAddress:$("#emailAddress").val();
            $scope.password = $scope.password && !$scope.loginInvalid?$scope.password:$("#password").val();
            if($scope.rememberme || $("#rememberme").is(":checked")) {
                if($scope.emailAddress && $scope.password) {
                    let hash = btoa($scope.emailAddress+":"+$scope.password);
                    $window.sessionStorage['sugarbot_userinfo'] = hash;
                }
            }
            loginService.login($scope.emailAddress, $scope.password).then(res => {
                if (res && res === "logged in") {
                    $window.location.href = '/confectionery';
                    $scope.loginInvalid = false;
                } else if (res && res === "logged in as admin") {
                    $window.location.href = '/admin/users';
                    $scope.loginInvalid = false;
                } else if (res) {
                    $scope.loginInvalid = true;
                    $scope.errorMessage = res;
                    if ($scope.rememberme)
                        $scope.loginAsNew();
                } else {
                    $scope.loginInvalid = true;
                    $scope.password = null;
                    $scope.errorMessage = "Incorrect user name or password.";
                    if ($scope.rememberme)
                        $scope.loginAsNew();
                }
            }).catch(function(e) {
                console.log(err);
                if (err.status === 401) {
                    $scope.loginInvalid = true;
                }
            });
        };

        $scope.checkSessionState = () => {
            let sessionData = authorizedService.returnSessionObjByKey('userInfo');
            if (sessionData) {
                $window.location.href = '/';
            }
        };

        $scope.dismissAlert = function() {
            $scope.loginInvalid = false;
        };


        $scope.resetPassword = () => {
            $scope.passwordResetSelected = true;
            loginService.resetPassword($scope.emailAddress).then(res => {
                $scope.passwordResetResponse = res.message;
            }).catch(err => {

                // do something
            } );
        }

    }]);
