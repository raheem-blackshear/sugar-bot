
angular.module('sweetLeads.admin.users', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
//        console.log(authorizedService);
        $routeProvider.when('/admin/users', {
            templateUrl: 'admin/users/users.html',
            controller: 'adminUsersCtrl',
            resolve: {
                'auth': (authorizedService) => {
                    return authorizedService.authenticate();
                }
            }

        });
    }])

    .controller('adminUsersCtrl', ['$q', '$document', '$uibModal', '$log', 'projectListService', 'dataSourcesService', 'dataService', 'projectService', '$location', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService', '$cookies','loginService',
        function($q, $document, $uibModal, $log, projectListService, dataSourcesService, dataService, projectService, $location, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies, loginService) {

          $scope.users = [];
          $scope.charges = [];

          $http.get('/api/stripePayment/getCharges',
            {
              headers: {
                Authorization: authorizedService.returnAuthHeader()
              }
            }).then((res) => {
              if (res.data.status == 'success') {
                  $scope.charges = res.data.data.data;
                  $scope.getAllUsers();
              }
            });

          $scope.getAllUsers = function() {
            loginService.getAllUser().then(users => {
                $scope.users = [];
                for(var i = 0; i < users.length; i++) {
                    let user = users[i];
                    let charges = _.filter($scope.charges, function(charge) { return charge.customer==user.stripeId && charge.amount > 0; })
                    user.spent = 0;
                    user.sugarcash = 0;
                    user.credit.forEach(function(credit) {
                      user.sugarcash += credit.amount;
                    })
                    charges.forEach(function(charge) {
                      user.spent += charge.amount / 100;
                    });

                    $scope.users.push(user);
                }
                $scope.sweetLeadsParams = new NgTableParams({}, { dataset: $scope.users, counts: [] });
            });
          }

          $scope.active = function(user, active) {
            loginService.active(user._id, active).then(res => {
                $scope.getAllUsers();
            });
          }

          $scope.reopen = function(user) {
            loginService.reopen(user._id).then(res => {
                $scope.getAllUsers();
            });
          }

    }])
