
angular.module('sweetLeads.projects', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
      //  console.log(authorizedService);
        $routeProvider.when('/projects', {
            templateUrl: 'projects/projects.html',
            controller: 'projectsCtrl',
            resolve: {
                'auth': (authorizedService) => {
                    localStorage.removeItem('selectedProject');
                    return authorizedService.authenticate();
                }
            }

        });
    }])

    .controller('projectsCtrl', ['$q', '$document', '$uibModal', '$log', 'projectListService', 'dataSourcesService', 'dataService', 'projectService', '$location', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService', '$cookies','loginService',
        function($q, $document, $uibModal, $log, projectListService, dataSourcesService, dataService, projectService, $location, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies, loginService) {

            $scope.listSelect = {};
            $scope.dataSources = [];
            $scope.deleteSuccess = false;
            $scope.deleteFail = false;
            $scope.hasPardot = false;
            $scope.selectedRows = [];
            $scope.priceList = [];
            $scope.coupons = [];
            $scope.purchasedList = [];
            $scope.userCoupons = [];
            $scope.couponCode = "";
            $scope.couponErrorMessage = "";
            $scope.state = '';
            $scope.stripeId = '';
            $scope.stripeInfo = null;
            $scope.taxrate = null;
            $scope.maxSugarCash = $rootScope.sugarcash;
            $scope.sugarCash = "$0.00";
            $scope.credits = [];
            $scope.calculatedRates = {
              'totalCount': 0,
              'price': 0.00,
              'tax': 0.00,
              'sugarcash': 0.00,
              'discount': 0.00,
              'total': 0.00
            };

            if (!$rootScope.reqModel) {
                $rootScope.reqModel = $cookies.getObject('reqModel');
            }

            //service call to projectService to retrieve projects
            $scope.projects = [];
         
            $scope.getAllProjects = function() {
              
              projectService.getAll().then(response => {
                  $scope.projectTable = response.sort(function(a, b){
                    console.log(response)
                      if (a.createdDate < b.createdDate) {
                          return 1;
                      }
                      if (a.createdDate > b.createdDate) {
                          return -1;
                      }
                      return 0;
                  });

              }).catch (err => {
                  console.error(err);
              });
            }

            $scope.getStripeInfo = function() {
              $http.post('/api/stripePayment/getCustomer',
                {
                  customerId: $scope.stripeId
                }, {
                  headers: {
                    Authorization: authorizedService.returnAuthHeader()
                  }
                }).then((res) => {
                  if (res.data.status == 'success') {
                      $scope.stripeInfo = res.data.data;
                  }
                });
              $http.get('/api/stripePayment/getCoupons',
                {
                  headers: {
                    Authorization: authorizedService.returnAuthHeader()
                  }
                }).then((res) => {
                  if (res.data.status == 'success') {
                      $scope.coupons = res.data.data.data;
                  }
                });
            }

            $scope.getTaxInfo = function () {
              $http.get('/api/stripePayment/getTaxrates',
                {
                  headers: {
                    Authorization: authorizedService.returnAuthHeader()
                  }
                }).then((res) => {
                  if (res.data.status == 'success') {
                      $scope.taxrate = _.filter(res.data.data.data, function(tax) { return tax.jurisdiction == $rootScope.states[$scope.state] && tax.active; });
                  }
                });
            }

            dataSourcesService.getAll().then(res => {
                $scope.dataSources = res;
                $scope.getAllProjects();
            }).catch(err => {
                console.error(err);
            });


            loginService.getUser().then(user => {
                $scope.state = user.state;
                $scope.stripeId = user.stripeId;
                $scope.userCoupons = user.coupons ? user.coupons : [];
                $scope.credits = user.credit;
                $scope.purchasedList = user.purchasedListIds;
                if($scope.stripeId)
                  $scope.getStripeInfo();
                if($scope.state)
                  $scope.getTaxInfo();
            });

            $scope.toggleSelection = function(listId) {
                var idx = $scope.selectedRows.indexOf(listId);
                if (idx > -1) {
                  $scope.selectedRows.splice(idx, 1);
                }
                else {
                  $scope.selectedRows.push(listId);
                }
                $scope.calculatePrice();
            };

            // $scope.selectAllRows = function(event, projectList) {
            //     if(event.target.checked) {
            //       projectList.entries.forEach(function(entry) {
            //         $scope.selectedRows.push(entry._id);
            //       })
            //     } else {
            //       $scope.selectedRows = [];
            //     }
            // }

            $scope.addProject = () =>{
                $rootScope.reqModel = {};
                localStorage.removeItem("selectedProject");
                $location.path('/confectionery');
            };

            $scope.ago = (timeData) => {
                return jQuery.timeago(timeData);
            }

            $scope.selectedLists = {};
            $scope.lists = [];

            $scope.projectListTable = [];
            $scope.selectedProjectListId = -1;

            $scope.selectedProject = {};

            $scope.selectProject = (project) => {
                $scope.projectName = project.name;

                $scope.selectedProject = project;

                // $scope.getDataSources($scope.selectedProject).then((resp) => {
                //     if (resp) {
                //         $scope.selectedProject.dataSrcName = resp;
                //     }
                // });

                projectListService.getAllForProject(project._id).then (response=>{
                    $scope.projectListTable = response;
                    if(response.length > 0) {
                        $scope.projectListTable.forEach(function(item) {
                          $scope.selectedRows.push(item._id);
                        })
                        $scope.calculatePrice();
                        $scope.selectedProjectListId = response[0]._id;
                    } else {
                        $scope.selectedProjectListId =  -1;
                    }
                }).catch (err=> {
                    console.error(err);
                })

            };
            $scope.projectClass = (currentProject) => {
                return currentProject.project.name == $scope.projectName ? 'selected-project' : '';
            };


            $scope.selectProjectList = (currentProjectId) => {
                $scope.selectedProjectListId = currentProjectId;
                $scope.selectedRows = [];
            };

            $scope.isActive = (id) => {
                return id == $scope.selectedProjectListId ? 'active' : '';
            }

            $scope.formatDate = (unformattedDate) =>{
                return unformattedDate.split('T')[0];
            };

            $scope.deleteLead = (lead) =>{
                // console.log(oneList);
                // console.log($scope.projectListId);

                projectListService.deleteEntry($scope.projectListId, lead.currentEntry.company).then (response => {
                    $scope.currentEntries = response.entries;
                    $scope.listTable = new NgTableParams({}, {dataset: response.entries, counts: []});
                }).catch (err => {
                    console.error(err);
                })

            };

            $scope.getDataSourceName = (dataSourceId) => {
              for(var i = 0; i < $scope.dataSources.length; i++)
                if($scope.dataSources[i].id == dataSourceId)
                  return $scope.dataSources[i].title;
            }

            $scope.removeSelectedProject = (project) =>{
              $uibModal.open({
                templateUrl: '/settings/confirmModal.html',
                controller: function ($scope, $uibModalInstance) {
                  $scope.confirmMessage = "Are you sure you want to remove this project?";
                  $scope.ok = function () {
                      $http.get('/api/project/deleteproject/' + project._id, { headers: { Authorization: authorizedService.returnAuthHeader() }}).then((res)=>{
                          if (res.data.status == 'ok') {
                              location.reload();
                          }
                      });
                  };
                  $scope.cancel = function () {
                    $uibModalInstance.close(false);
                  };
                },
                controllerAs: 'scope',
                scope: $scope
              })
            }

            $scope.pardotSync = () => {
                if ($scope.hasPardot) {
                    let projectListId = $scope.projectListId;
                    if (!projectListId) return;
                    projectListService.pardotSync(projectListId).then(response => {
                        // handle this response
                    }).catch(err => {
                        console.error(err);
                        // handle this error
                    })
                } else {
                    //modal
                        let parentElem = undefined;
                        let modalInstance = $uibModal.open({
                            animation: $scope.animationsEnabled,
                            ariaLabelledBy: 'modal-title',
                            ariaDescribedBy: 'modal-body',
                            templateUrl: 'myModalContent.html',
                            controller: 'ModalInstanceCtrl',
                            controllerAs: '$scope',
                            size: undefined,
                            appendTo: parentElem,
                            resolve: {}
                        });

                        modalInstance.result.then(res => {
                            // don't do anything.
                        })
                    }
            };

            $scope.alertDialog = function (message) {
              $uibModal.open({
                templateUrl: '/confectionery/alertModal.html',
                controller: function ($scope, $uibModalInstance) {
                  $scope.confirmMessage = message;
                  $scope.ok = function () {
                    $uibModalInstance.close(true);
                  };
                },
                controllerAs: 'scope',
                scope: $scope
              })
            }

            $scope.onAddList = (projectList) => {
                if($scope.selectedRows.length > 0) {
                    let records = _.filter(projectList.entries, function(entry) { return $scope.selectedRows.indexOf(entry._id) >= 0; })
                    $uibModal.open({
                      templateUrl: '/projects/listNameModal.html',
                      controller: function ($scope, $uibModalInstance) {
                        $scope.listname = "";
                        $scope.errorMessage = "";
                        $scope.addList = function () {
                          if($scope.listname) {
                              projectListService.save(
                                {
                                    name: $scope.listname,
                                    projectId: $scope.selectedProject._id,
                                    entries: records
                                }).then(projectList => {
                                if (projectList.status === "error"){
                                    // $scope.saveError = true;
                                    $scope.errorMessage = projectList.message;
                                } else {
                                    $scope.getAllProjects();
                                    $scope.selectProject($scope.selectedProject);
                                    $scope.selectedRows = [];
                                    $uibModalInstance.close(true);
                                }
                            });
                          } else {
                            $scope.errorMessage = "List Name field is required."
                          }
                        };
                        $scope.cancel = function () {
                          $uibModalInstance.close(false);
                        };
                      },
                      controllerAs: 'scope',
                      scope: $scope
                    })
                } else {
                    $scope.alertDialog("You have to choose at least one records in the list.")
                }
            }
            $scope.onBlaster = () => {
                $scope.selectedProject.entries = $scope.projectListTable[0].entries;
                localStorage.setItem('selectedProject', JSON.stringify($scope.selectedProject));
                $location.path('/blaster');
                // alert('Blaster: Coming Soon');
            };
            $scope.addList = (project) => {
                localStorage.setItem('selectedProject', JSON.stringify(project));
                $location.path('/confectionery');
            };
            $scope.onCRM = () => {
                $rootScope.activeTab = "CRM";
                $location.path('/settings');
            };

            $scope.closeProjectBox = function () {
                $scope.selectedProjectListId = -1;
            }
            $scope.onDelete = () => {
                if (confirm('Are you sure you want to remove this project ?')) {
                    $http.get('/api/project/deleteproject/' + $scope.selectedProject._id, { headers: { Authorization: authorizedService.returnAuthHeader() }}).then((res)=>{
                        if (res.data.status == 'ok') {
                            location.reload();
                        }
                    });
                }
            };

            $scope.downloadCSV = () => {
                projectListService.downloadsCSV(
                    $scope.selectedRows
                ).then(response => {
                    // handle this response
                    $scope.selectedRows.forEach(function(listId) {
                      if($scope.purchasedList.indexOf(listId) < 0)
                        $scope.purchasedList.push(listId);
                    })
                    loginService.updatePurchasedList($scope.purchasedList);
                }).catch(err => {
                    console.error(err);
                    // handle this error
                })
            }

            $scope.onCSV = () => {
                projectListService.downloadCSV(
                    $scope.selectedProjectListId
                ).then(response => {
                    // handle this response
                }).catch(err => {
                    console.error(err);
                    // handle this error
                })
            };

            $scope.editEntry = function(project, entry) {
              $scope.editEntryModal(project, entry);
            }

            $scope.removeEntry = function(project, entry) {
              $scope.confirmModal(project, entry);
            }

            $scope.editEntryModal = function (project, entry) {
              $uibModal.open({
                templateUrl: '/projects/editEntryModal.html',
                controller: function ($scope, $uibModalInstance) {
                  $scope.changedName = entry.name;
                  $scope.changedCompany = entry.company;
                  $scope.changedWebsite = entry.website;
                  $scope.changedEmail = entry.email;
                  $scope.changedAddress1 = entry.address1;
                  $scope.changedAddress2 = entry.address2;
                  $scope.changedCity = entry.city;
                  $scope.changedState = entry.state;
                  $scope.changedZipcode = entry.zipcode;
                  $scope.changedCountry = entry.country;
                  $scope.changedPhone = entry.phone;
                  $scope.updateEntry = function () {
                    entry.name = $scope.changedName;
                    entry.company = $scope.changedCompany;
                    entry.website = $scope.changedWebsite;
                    entry.email = $scope.changedEmail;
                    entry.address1 = $scope.changedAddress1;
                    entry.address2 = $scope.changedAddress2;
                    entry.city = $scope.changedCity;
                    entry.state = $scope.changedState;
                    entry.zipcode = $scope.changedZipcode;
                    entry.country = $scope.changedCountry;
                    entry.phone = $scope.changedPhone;
                    projectListService.updateEntry(project._id, entry).then (response => {
                        $scope.getAllProjects();
                        $uibModalInstance.close(true);
                    }).catch (err => {
                        console.error(err);
                    })
                  };
                  $scope.cancel = function () {
                    $uibModalInstance.close(false);
                  };
                },
                controllerAs: 'scope',
                scope: $scope
              })
            }

            $scope.confirmModal = function (project, entry) {
              $uibModal.open({
                templateUrl: '/settings/confirmModal.html',
                controller: function ($scope, $uibModalInstance) {
                  $scope.confirmMessage = "Are you sure you want to remove this entry?";
                  $scope.ok = function () {
                    projectListService.deleteEntry(project._id, entry._id).then (response => {
                        project.entries.splice(project.entries.indexOf(entry), 1);
                        $scope.getAllProjects();
                        $uibModalInstance.close(true);
                    }).catch (err => {
                        console.error(err);
                    })
                  };
                  $scope.cancel = function () {
                    $uibModalInstance.close(false);
                  };
                },
                controllerAs: 'scope',
                scope: $scope
              })
            }

            $scope.blurSugarCash = function () {
                $scope.sugarCash = $("#sugarcash").val();
                let sugarcash = parseFloat($scope.sugarCash.substr(1));
                if(isNaN(sugarcash)) {
                  $scope.alertDialog("Please type correct number.");
                } else {
                  if(sugarcash > 0 && (sugarcash > $scope.maxSugarCash || sugarcash > $scope.calculatedRates.price - 1)) {
                    $scope.alertDialog("The value should be less than current balance of SugarCash and Price.");
                  } else if(sugarcash > 0) {
                    $scope.calculatedRates.sugarcash = sugarcash;
                  } else
                    return;
                }
                $scope.focusSugarCash();
                $scope.calculatePrice();
            }

            $scope.focusSugarCash = function () {
                $scope.sugarCash = "$"+$scope.calculatedRates.sugarcash.toFixed(2);
            }

            $scope.calculateCoupon = function (coupon) {
                if($scope.calculatedRates.coupon && $scope.calculatedRates.coupon == coupon) return;
                $scope.calculatedRates.coupon = coupon;
                if(coupon.amount_off) {
                  $scope.calculatedRates.discount = coupon.amount_off * 0.01;
                } else if(coupon.percent_off) {
                  $scope.calculatedRates.discount = $scope.calculatedRates.price * coupon.percent_off / 100;
                }
                $scope.couponErrorMessage = "";
                $scope.calculatePrice();
            }

            $scope.getSugarCash = function (total) {
                if(total >= 500)
                  return 125;
                else if(total >= 250)
                  return 50;
                else if(total >= 100)
                  return 15;
                else if(total >= 50)
                  return 5;
                else if(total >= 20)
                  return 1;
                else
                  return 0;
            }

            $scope.calculatePrice = function() {
                let startPrice = 0;
                let totalCount = 0;
                $scope.priceList = [];
                console.log($scope.projectListTable);
                angular.forEach($scope.projectListTable, function (item) {
                    let dataSource = _.filter($scope.dataSources, function(source) { return source.id == item.dataSources[0]; });
                    let priceItem = {
                      id: item._id,
                      listName: item.name,
                      sourceId: item.dataSources[0],
                      planId: dataSource[0].plan.id,
                      sourceName: dataSource[0].title,
                      taxPercent: dataSource[0].taxpercent,
                      price: ($scope.purchasedList.indexOf(item._id)<0)?dataSource[0].price:0,
                      count: item.entries.length
                    };
                    $scope.priceList.push(priceItem);
                    if($scope.selectedRows.indexOf(item._id)>=0)
                      startPrice += priceItem.price * priceItem.count;
                    totalCount += priceItem.count;
                });
                $scope.calculatedRates.totalCount = totalCount;
                $scope.calculatedRates.price = startPrice;
                $scope.calculatedRates.tax = (startPrice - $scope.calculatedRates.sugarcash - $scope.calculatedRates.discount) / 100 * parseFloat($scope.taxrate[0].percentage);
                $scope.calculatedRates.total = startPrice - $scope.calculatedRates.sugarcash - $scope.calculatedRates.discount + $scope.calculatedRates.tax;
            }

            $scope.export = (project) => {
              $scope.calculatePrice();
              let modalInstance = $uibModal.open({
                  animation: $scope.animationsEnabled,
                  ariaLabelledBy: 'modal-title',
                  ariaDescribedBy: 'modal-body',
                  templateUrl: '/confectionery/checkoutModal.html',
                  controller: function ($uibModalInstance) {
                      $scope.paymentProcessed = false;
                      $scope.closePayment = function () {
                          $uibModalInstance.dismiss();
                      }
                      $scope.updateCoupon = function() {
                        if(!$("#couponCode").val()) {
                          $scope.calculatedRates.discount = 0;
                          $scope.couponErrorMessage = "";
                          $scope.calculatePrice();
                          return;
                        }
                        $scope.couponCode = $("#couponCode").val();
                        let coupons = _.filter($scope.coupons, function(coupon) { return coupon.name == $scope.couponCode && coupon.valid; });
                        if(coupons.length > 0) {
                          if(coupons[0].duration == "once") {
                            let temp = _.filter($scope.userCoupons, function(coupon) { return coupon.id == coupons[0].id })
                            if(temp.length > 0) {
                              $scope.calculatedRates.discount = 0;
                              $scope.couponErrorMessage = "You have already used this coupon before.";
                              $scope.calculatePrice();
                            } else {
                              $scope.calculateCoupon(coupons[0]);
                            }
                          } else {
                            $scope.calculateCoupon(coupons[0]);
                          }
                        } else {
                          $scope.calculatedRates.discount = 0;
                          $scope.couponErrorMessage = "Your coupon code is invalid.";
                          $scope.calculatePrice();
                        }
                      }
                      $scope.processPayment = function () {
                          $scope.couponErrorMessage = "";
                          if($scope.calculatedRates.total < 0.6) {
                            $uibModalInstance.close(true);
                            return;
                          }
                          let data = {
                            customerId: $scope.stripeId,
                            totalPrice: parseInt($scope.calculatedRates.total*100)
                          }
                          if($scope.stripeInfo.sources.data.length==0)
                            data.token = response.id;
                          $http.post('/api/stripePayment/createCharges', data,
                            {
                              headers: {
                                Authorization: authorizedService.returnAuthHeader()
                              }
                            }).then((res) => {
                              if (res.data.status == 'success') {
                                  $uibModalInstance.close(true);
                              }
                            });
                      }
                      this.stripeCallback = function (status, response) {
                          if (response.error) {
                              // there was an error. Fix it.
                              $scope.couponErrorMessage = "Your card information is invalid.";
                          } else {
                              $scope.couponErrorMessage = "";
                              if($scope.calculatedRates.total < 0.6) {
                                $uibModalInstance.close(true);
                                return;
                              }
                              let data = {
                                customerId: $scope.stripeId,
                                totalPrice: parseInt($scope.calculatedRates.total*100)
                              }
                              if($scope.stripeInfo.sources.data.length==0)
                                data.token = response.id;
                              $http.post('/api/stripePayment/createCharges', data,
                                {
                                  headers: {
                                    Authorization: authorizedService.returnAuthHeader()
                                  }
                                }).then((res) => {
                                  if (res.data.status == 'success') {
                                      $uibModalInstance.close(true);
                                  }
                                });
                          }
                      };
                  },
                  controllerAs: 'scope',
                  scope: $scope
              });
              modalInstance.result.then(res => {
                  if (res === true) {
                    if(!$scope.calculatedRates.discount>0 && ($scope.getSugarCash($scope.calculatedRates.total) > 0 || $scope.calculatedRates.sugarcash > 0)) {
                      if($scope.calculatedRates.sugarcash > 0)
                        $scope.credits.push({amount: $scope.calculatedRates.sugarcash * (-1), description: $scope.reqModel.projectName + " - " + $scope.reqModel.state + " - " + $scope.reqModel.term})
                      if($scope.getSugarCash($scope.calculatedRates.total) > 0)
                        $scope.credits.push({amount: $scope.getSugarCash($scope.calculatedRates.total), description: $scope.reqModel.projectName + " - " + $scope.reqModel.state + " - " + $scope.reqModel.term})
                      loginService.updateCredit($scope.credits).then(response => {
                        $scope.downloadCSV();
                      });
                    } else {
                      $scope.downloadCSV();
                    }
                  }
              });
            }
  }])
