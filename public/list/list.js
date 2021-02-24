angular.module('sweetLeads.list', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
//        console.log(authorizedService);
        $routeProvider.when('/recentProjects', {
            templateUrl: 'list/list.html',
            controller: 'listCtrl',


        });
    }])

    .controller('listCtrl', ['projectListService', 'projectService', '$location', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService', '$cookies',
        function(projectListService, projectService, $location, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies) {

            $scope.listSelect = {};

            if (!$rootScope.reqModel) {
                $rootScope.reqModel = $cookies.getObject('reqModel');
            }

            //service call to projectService to retrieve projects
            $scope.projects = [];
            projectService.getAll().then(response => {

                $scope.projects = response.sort(function(a, b){
                    if (a.createdDate < b.createdDate) {
                        return 1;
                    }
                    if (a.createdDate > b.createdDate) {
                        return -1;
                    }
                    return 0;
                }).slice(0,3);

                $scope.projects.forEach(project => {
                    projectListService.getAllForProject(project._id).then (response => {
                        project.listCount = response.length;
                    }).catch (err => {
                        console.error(err);
                    });
                });

            }).catch (err => {
                console.error(err);
            });

            $scope.selectedLists = {};
            //select lists
            $scope.selectLists = (selectedList) => {
                //display lists in table
                $scope.lists = [];
                $scope.projectName = selectedList.project.name;
                projectListService.getAllForProject(selectedList.project._id).then ( response => {
                    $scope.selectedLists = response;

                    let listNames = [];
                    response.forEach(response => {
                        let name = response.name;
                        listNames.push({value: name});
                    });

                    $scope.listSelect.data = listNames;
                    $scope.listSelect.model = listNames[0].value;
                    bindDataToGrid($scope.selectedLists[0].entries);

                }).catch (err => {
                    console.error(err);
                })

            };

            $scope.addProject = () =>{
                $rootScope.reqModel = {};
                $location.path('/sandbox');
            };

            function bindDataToGrid(entries) {
                $scope.listTable = new NgTableParams({}, {dataset: entries, counts: []});
            }

            $scope.listDisplay = () =>{
                console.log($scope.listSelect.model);
                $scope.selectedLists.forEach(list => {
                    if(list.name === $scope.listSelect.model){
                        bindDataToGrid(list.entries);
                    }
                })
            }
    }]);
