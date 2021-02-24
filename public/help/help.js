angular.module('sweetLeads.help', ['ngTable'])

  .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/help', {
          templateUrl: 'help/help.html',
          controller: 'helpCtrl',
          resolve: {
              'auth': (authorizedService) => {
                  localStorage.removeItem('selectedProject');
                  return authorizedService.authenticate();
              }
          }
      });
  }])

  .controller('helpCtrl', ['loginService','$location','dataSourcesService', 'dataService', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService','$cookies','searchService',
    function (loginService, $location, dataSourcesService, dataService, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies,searchService) {
        $scope.name = "";
        $scope.email = "";
        $scope.phone = "";
        $scope.message = "";
        $scope.subject = "";
        $scope.alertMessage = "";
        $scope.successMessage = "";
        $scope.submit = function () {
            if(!$scope.name) {
              $scope.alertMessage = "Name is required.";
              return;
            }
            if(!$scope.email) {
              $scope.alertMessage = "Email is required or should be correct format.";
              return;
            }
            if(!$scope.subject) {
              $scope.alertMessage = "Subject is required.";
              return;
            }
            if(!$scope.message) {
              $scope.alertMessage = "Message is required.";
              return;
            }

            $scope.alertMessage = "";
            $scope.successMessage = "";
            $http({
                headers: {Authorization: authorizedService.returnAuthHeader()},
                method: "POST",
                url: '/api/users/help',
                data: {
                  name: $scope.name,
                  email: $scope.email,
                  phone: $scope.phone,
                  subject: $scope.subject,
                  message: $scope.message
                }
            }).then(res => {
                if(res.data.status=="success")
                    $scope.successMessage = "Your message has been sent successfully."
            }).catch(err => {
                $scope.alertMessage = "Internal server error. Try again later."
            })
        }
  }]);
