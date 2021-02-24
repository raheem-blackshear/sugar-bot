
angular.module('sweetLeads.sugarcash', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
//        console.log(authorizedService);
        $routeProvider.when('/sugarcash', {
            templateUrl: 'sugarcash/sugarcash.html',
            controller: 'sugarCashCtrl',
            resolve: {
                'auth': (authorizedService) => {
                    localStorage.removeItem('selectedProject');
                    return authorizedService.authenticate();
                }
            }

        });
    }])

    .controller('sugarCashCtrl', ['$q', '$document', '$uibModal', '$log', 'projectListService', 'dataSourcesService', 'dataService', 'projectService', '$location', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService', '$cookies','loginService',
        function($q, $document, $uibModal, $log, projectListService, dataSourcesService, dataService, projectService, $location, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies, loginService) {

          $scope.user = {};

          loginService.getUser().then(user => {
              $scope.user = user;
              $scope.sweetLeadsParams = new NgTableParams({}, { dataset: $scope.user.credit, counts: [] });
          });

    }])
