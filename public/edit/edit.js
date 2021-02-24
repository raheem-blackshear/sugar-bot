angular.module('sweetLeads.edit', ['ngTable'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/edit', {
            templateUrl: 'edit/edit.html',
            controller: 'editCtrl',
        });
    }])

    .controller('editCtrl', ['$q', '$document', '$uibModal', '$log', '$document', 'projectListService', 'projectService', '$location', 'dataSourcesService', 'dataService', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService', '$cookies', 'searchService',
        function ($q, $document, $uibModal, $log, $document, projectListService, projectService, $location, dataSourcesService, dataService, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies, searchService) {
            $scope.isDisabled = true;
            $scope.listName = "";
            $scope.saveError = false;
            $scope.showMergeSuccess = false;
            $scope.hasLists = false;
            $scope.listSelect = {};
            $scope.projectList = [];
            $scope.hasSubscriptions = false;
            $scope.isEditingName = false;


            if (!$rootScope.reqModel) {
                $rootScope.reqModel = $cookies.getObject('reqModel');
            }

            if ($rootScope.reqModel && $rootScope.reqModel.selectedRows) {
                //retrieve selected items from /evaluate
                $scope.selectedRows = $rootScope.reqModel.selectedRows;
            }

            $scope.cancelEditName = function () {
                $scope.listName = $scope.prevlistName;
                $scope.isEditingName = !$scope.isEditingName;
            }

            $scope.toggleEditName = function () {
                $scope.isEditingName = !$scope.isEditingName;
                if($scope.isEditingName)
                    $scope.prevlistName = $scope.listName;
                setTimeout(function() {
                  $("#confProjectName").focus();
                }, 50)
            }

            $scope.projectName = $rootScope.reqModel.projectName;
            $scope.hasSubscriptions = $rootScope.reqModel.hasSubscriptions;


            //display selected items in table
            $scope.editParams = new NgTableParams({}, {dataset: $scope.selectedRows, counts: []});

            //display merge button if additional lists exist
                projectListService.getAll().then(projectList=>{
                    if(projectList.length){
                        $scope.hasLists = true;
                        $scope.projectList = projectList;
                        $scope.listSelect = $scope.projectList[0];
                    }
                }).catch(err=>{
                    console.error(err);
                });

            $scope.save = () => {
                $scope.saveError = false;
                $scope.showAlert = false;
                $scope.showSuccess = false;
                $scope.reqModel.projectName = $scope.projectName;
                if(localStorage.getItem('selectedProject')) {
                    $scope.reqModel.id=$scope.reqModel._id;
                    projectService.update($scope.reqModel).then(project => {
                        localStorage.removeItem('selectedProject');
                        projectListService.save(
                            {
                                name: $scope.listName,
                                projectId: $scope.reqModel._id,
                                entries: $scope.selectedRows
                            }).then(projectList => {
                            if (projectList.status === "error"){
                                $scope.saveError = true;
                                $scope.saveErrorMessage = projectList.message;

                            }
                            else if (projectList) {
                                // show alert that save was success!
                                $scope.saveError = false;
                                $scope.showAlert = false;
                                $scope.alertMessage = "Success! Your list is saved.";
                                $rootScope.reqModel = {};
                                $cookies.putObject("reqModel", $rootScope.reqModel);
                                $scope.showSuccess = true;
                                $location.path('/projects');
                            } else {
                                // Show alert that it didn't save
                                $scope.saveError = true;
                                $scope.alertMessage = "Oops! Something went wrong. Your list didn't save.";
                                $scope.showAlert = true;
                            }
                        });
                    }).catch(err => {
                        console.error(err)
                    });
                } else {
                    projectService.save($scope.reqModel).then(project => {
                        let projectId = project._id;
                        projectListService.save(
                            {
                                name: $scope.listName,
                                projectId: projectId,
                                entries: $scope.selectedRows
                            }).then(projectList => {
                            if (projectList.status === "error"){
                                $scope.saveError = true;
                                $scope.saveErrorMessage = projectList.message;

                            }
                            else if (projectList) {
                                // show alert that save was success!
                                $scope.saveError = false;
                                $scope.showAlert = false;
                                $scope.alertMessage = "Success! Your list is saved.";
                                $rootScope.reqModel = {};
                                $cookies.putObject("reqModel", $rootScope.reqModel);
                                $scope.showSuccess = true;
                                $location.path('/projects');
                            } else {
                                // Show alert that it didn't save
                                $scope.saveError = true;
                                $scope.alertMessage = "Oops! Something went wrong. Your list didn't save.";
                                $scope.showAlert = true;
                            }
                        });
                    }).catch(err => {
                        console.error(err)
                    });
                  }
            };

            $scope.dismissAlert = function () {
                $scope.showAlert = false;
            };

            $scope.dismissSuccess = function () {
                $scope.showSuccess = false;
            };

            $scope.items = [];


            $scope.animationsEnabled = true;

            $scope.openMergeModal = function () {
                let modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'myModalContent.html',
                    controller: function ($uibModalInstance) {
                        $scope.modalMerge = function () {
                            $uibModalInstance.close({status: "ok"});
                        };

                        $scope.modalCancel = function () {
                            $uibModalInstance.dismiss({status: "cancel"});
                        };
                    },
                    controllerAs: 'scope',
                    scope: $scope
                });

                modalInstance.result.then(res => {
                    projectListService.merge({entries: $scope.selectedRows}, $scope.listSelect._id).then (merge => {
                        //merge alert
                        $scope.showMergeSuccess = true;
                        $scope.alertMessage = "Sweet! Your lists have been merged successfully.";
                    }).catch(err => {
                        console.error(err);
                    })
                }).catch(err => {


                })

            };

            //breadcrumb links
            // $scope.goToIndustry = () => {
            //     $location.path('/sandbox');
            // };
            //
            // $scope.goToEvaluate = () => {
            //     $location.path('/evaluate');
            // };

        }])
