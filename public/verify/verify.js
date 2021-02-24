'use strict';
/**
 * Created by barre on 7/16/2017.
 */

angular.module('sweetLeads.verify', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {

        $routeProvider.when('/verify/:userId', {
            templateUrl: 'verify/verify.html',
            controller: 'verifyCtrl'
        });
    }])

    .controller('verifyCtrl', ['$window', '$location', '$routeParams', 'loginService', function ($window, $location, $routeParams, loginService) {
        let userId = $routeParams.userId;

        loginService.verifyAccount(userId)
            .then(res => {
                if (res.status === "ok") {
                    $location.path('/login');
                }
                else {
                    console.log(res);
                    $scope.alertMessage = res.message;
                    $scope.showAlert = true;
                }
            }).catch(err => {
            $scope.alertMessage = "Server Error";
            $scope.showAlert = true;
        });

        $scope.goToLogin = () => {
            $window.location.href = '/login';
        }
    }]);