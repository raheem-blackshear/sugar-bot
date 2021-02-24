
angular.module('sweetLeads.admin.projects', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
//        console.log(authorizedService);
        $routeProvider.when('/admin/projects', {
            templateUrl: 'admin/projects/projects.html',
            controller: 'adminProjectsCtrl',
            resolve: {
                'auth': (authorizedService) => {
                    return authorizedService.authenticate();
                }
            }

        });
    }])

    .controller('adminProjectsCtrl', ['$q', '$document', '$uibModal', '$log', 'projectListService', 'dataSourcesService', 'dataService', 'projectService', '$location', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService', '$cookies','loginService',
        function($q, $document, $uibModal, $log, projectListService, dataSourcesService, dataService, projectService, $location, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies, loginService) {
        $scope.projects = [];
        $scope.dataSources = [];
        $scope.records = [];
        $scope.projectListTable = [];
        $scope.selectedProjectListId = -1;

        $scope.getDataSourceName = (dataSourceId) => {
          for(var i = 0; i < $scope.dataSources.length; i++)
            if($scope.dataSources[i].id == dataSourceId)
              return $scope.dataSources[i].title;
        }
        
        $scope.getAllProjects = function () {
          projectService.getAllProjects().then(projects => {
              projects.forEach(function(project) {
                  // let dataSources = _.filter($scope.dataSources, source => {
                  //   return project.dataSources.indexOf(source.id)>=0;
                  // });
                  // project.dataSourcesString = [];
                  // dataSources.forEach(source => {
                  //   project.dataSourcesString.push(source.title);
                  // })
                  $scope.projects.push(project);
              });
              $scope.sweetProjectsTable = new NgTableParams({}, { dataset: $scope.projects, counts: [] });
          });
        }

        $scope.detailProject = function(project) {
            projectListService.getAllForProject(project._id).then (response=>{
                $scope.projectListTable = response;
                $scope.selectedProjectListId = response[0]._id;
            }).catch (err=> {
                console.error(err);
            })
        }

        dataSourcesService.getAll().then(res => {
            $scope.dataSources = res;
            $scope.getAllProjects();
        }).catch(err => {
            console.error(err);
        });

        $scope.selectProjectList = (currentProjectId) => {
            $scope.selectedProjectListId = currentProjectId;
        };
    }])
