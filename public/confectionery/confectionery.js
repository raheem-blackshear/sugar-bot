'use strict';
/**
 * Created by barre on 7/16/2017.
 */
 // Stripe.setPublishableKey('pk_test_mfNm0kR6onyFDj2Q2iGOMk0V');
//  "test_240e53ea4dac0cb2dcaf465965fe5a31536";
 
 const lobApiKey = "live_e6cb3253829b0a97e26418f22fc14956a0c";
 Stripe.setPublishableKey('pk_live_ucolxEL7HPgidQDMmawVcQF3');

angular.module('sweetLeads.confectionery', ['ngTable', 'angularPayments', 'ngAutocomplete'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/confectionery', {
            templateUrl: 'confectionery/confectionery.html',
            controller: 'confectioneryCtrl',
            resolve: {
                'auth': (authorizedService) => {
                    // localStorage.removeItem('selectedProject');
                    return authorizedService.authenticate();
                }
            }
        });
    }])

    .controller('confectioneryCtrl', ['loginService', '$location', 'dataSourcesService', '$uibModal', 'dataService', 'projectService', 'projectListService', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService', '$cookies', 'searchService', '$interval',
        function (loginService, $location, dataSourcesService, $uibModal, dataService, projectService, projectListService, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies, searchService, $interval) {
            $scope.loadingStatus = 0;
            $scope.progressWidth = {width: '0%'};
            $scope.city = "";
            $scope.progressInterval = null;
            $scope.loading = false;
            $scope.showAlert = false;
            $scope.statesSelect = {};
            $scope.industrySelect = {};
            $scope.subindustrySelect = {};
            $scope.subsubindustrySelect = {};
            $scope.isDisabled = true;
            $scope.isEditingName = false;
            $scope.isEditingListName = false;
            $scope.inputLocationTags = [];
            $scope.inputIndustryTags = [];
            $scope.inputKeywordTags = [];
            $scope.suggestedTags = [];
            $scope.projects = [];
            $scope.hasSubscriptions = false;
            $scope.hasSelections = false;
            $scope.sweetLeadsParams = new NgTableParams({}, { dataset: [], counts: [] });
            $rootScope.selectedProject = null;
            $rootScope.selectedCostPerMonth = 0;
            $rootScope.selectedCostPerYear = 0;
            $scope.sweetLeadsData = [];
            $scope.recordIds = [];
            $scope.priceList = [];
            $scope.coupons = [];
            $scope.userCoupons = [];
            $scope.couponCode = "";
            $scope.couponErrorMessage = "";
            $scope.SelectedLocation = "";
            $scope.options = {
              country: 'us'
            }
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
            $scope.slider = {
                value: 5,
                options: {
                    floor: 1,
                    ceil: 10,
                    showSelectionBar: true,
                    getSelectionBarColor: function(value) {
                        return '#2AE02A';
                    }
                }
            };

            $scope.position = { "lat":40.697,"lng":-74.1197,radius:5,isSelected:false }

            if(localStorage.getItem('selectedProject')) {
              $scope.reqModel = JSON.parse(localStorage.getItem('selectedProject'));
              $scope.projectName = $scope.reqModel.name;
              localStorage.removeItem('selectedProject');

              // $scope.getSearchResults();
            }

            bindData();

            projectService.getAll().then(projectList => {
                $scope.projects = projectList;
            });

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

            if (!$rootScope.reqModel) {
                $rootScope.reqModel = {};
            }

            $scope.getStateNames = function () {
                dataSourcesService.getStateNames().then(res => {
                });
            };

            $scope.focusSugarCash = function () {
                $scope.sugarCash = "$"+$scope.calculatedRates.sugarcash.toFixed(2);
            }

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

            $scope.cancelEditListName = function () {
                $scope.listName = $scope.prevListName;
                $scope.isEditingListName = !$scope.isEditingListName;
            }

            $scope.toggleEditListName = function () {
                $scope.isEditingListName = !$scope.isEditingListName;
                if($scope.isEditingListName)
                    $scope.prevListName = $scope.listName;
                else {
                }
                setTimeout(function() {
                  $("#confListName").focus();
                }, 50)
            }

            $scope.cancelEditName = function () {
                $scope.projectName = $scope.prevProjectName;
                $scope.isEditingName = !$scope.isEditingName;
            }

            $scope.toggleEditName = function () {
                $scope.isEditingName = !$scope.isEditingName;
                if($scope.isEditingName)
                    $scope.prevProjectName = $scope.projectName;
                else {
                }
                setTimeout(function() {
                  $("#confProjectName").focus();
                }, 50)
            }

            $scope.calculatePrice = function() {
                let startPrice = 0;
                let totalCount = 0;
                $scope.priceList = [];
                angular.forEach($scope.subscribedDataSourceParams, function (item) {
                    let priceItem = {
                      sourceId: item.id,
                      planId: item.plan.id,
                      sourceName: item.title,
                      taxPercent: item.taxpercent,
                      price: item.price,
                      count: $scope.sweetLeadsData.filter(data => data.source == item.id && $scope.checkboxes.items[data.rowNumber]).length
                    };
                    $scope.priceList.push(priceItem);
                    startPrice += priceItem.price * priceItem.count;
                    totalCount += priceItem.count;
                });
                $scope.calculatedRates.totalCount = totalCount;
                $scope.calculatedRates.price = startPrice;
                $scope.calculatedRates.tax = (startPrice - $scope.calculatedRates.sugarcash - $scope.calculatedRates.discount) / 100 * parseFloat($scope.taxrate[0].percentage);
                $scope.calculatedRates.total = startPrice - $scope.calculatedRates.sugarcash - $scope.calculatedRates.discount + $scope.calculatedRates.tax;
            }

            $scope.showSearchData = function () {
                if (!$scope.checkboxes) {
                    $scope.checkboxes = { 'checked': false, items: {} };
                }

                if (!$scope.checkboxes.checked) {
                    $scope.checkboxes = { 'checked': true, items: {} };
                }

                $scope.sweetLeadsParams = new NgTableParams({}, { dataset: $scope.sweetLeadsData, counts: [] });

                angular.forEach($scope.sweetLeadsData, function (item) {
                    if (angular.isDefined(item.rowNumber)) {
                        $scope.checkboxes.items[item.rowNumber] = true;
                    }
                });

                $scope.calculatePrice();
            }

            $scope.progressStop = function() {
              if (angular.isDefined($scope.progressInterval)) {
                $interval.cancel($scope.progressInterval);
                $scope.progressInterval = null;
                $scope.loadingStatus = 0;
              }
            }

            $scope.getSearchResults = function () {
                /*$scope.reqModel.industry = $scope.industrySelect.model;
                $scope.reqModel.subindustry = $scope.subindustrySelect.model;
                $scope.reqModel.subsubindustry = $scope.subsubindustrySelect.model;
                $scope.reqModel.state = $scope.statesSelect.model;
                $scope.reqModel.city = $scope.city;*/
                if ($scope.inputKeywordTags.length == 6) {
                    $scope.inputKeywordTags.pop();
                }
                $scope.subscribedDataSourceParams = $scope.availableDataSourceParams.filter(source => source.active == true);
                if ($scope.inputKeywordTags.length==0 || $scope.subscribedDataSourceParams.length==0) {
                    return;
                }

                if(!$scope.SelectedLocation && !$("#SelectedLocation").val()) {
                  return;
                }

                if($scope.loadingStatus > 0 && $scope.loadingStatus < 100) return;
                // $scope.reqModel.industry = $scope.inputIndustryTags.length == 0 ? '' : $scope.inputIndustryTags[0].text;
                $scope.reqModel.industry = '';
                $scope.reqModel.subindustry = '';
                $scope.reqModel.subsubindustry = '';
                $scope.reqModel.address = $scope.SelectedLocation?$scope.SelectedLocation:$("#SelectedLocation").val();
                // $scope.reqModel.city = $scope.reqModel.state.split(',')[0];
                // $scope.reqModel.projectName = $scope.projectName;
                $scope.position.radius = $scope.slider.value;

                if ($scope.reqModel.subindustry === "All") { $scope.reqModel.subindustry = "" }
                if ($scope.reqModel.subsubindustry === "All") { $scope.reqModel.subsubindustry = "" }
                if ($scope.reqModel.industry === "All") { $scope.reqModel.industry = "" }

                $scope.reqModel.inputKeywordTags = $scope.inputKeywordTags;
                // $scope.reqModel.inputIndustryTags = $scope.inputIndustryTags;
                // $scope.reqModel.inputLocationTags = $scope.inputLocationTags;

                $scope.reqModel.term = $scope.inputKeywordTags.map(e => e.text).join(",");

                // searchService.getSweetLeads($scope.reqModel, { active: $scope.subscribedDataSourceParams, inactive: $scope.availableDataSourceParams }).then(
                let apiCallPositionList = [];
                for(var lat = $scope.position.lat - 0.0163 * ($scope.slider.value / 2 - 0.5); lat < $scope.position.lat + 0.0163 * $scope.slider.value / 2; lat+=0.0163)
                  for(var lng = $scope.position.lng - 0.019 * ($scope.slider.value / 2 - 0.5); lng < $scope.position.lng + 0.019 * $scope.slider.value / 2; lng+=0.019)
                    apiCallPositionList.push({lat: lat, lng: lng})
                let timerIndex = apiCallPositionList.length, apiCallCount = 0;
                $scope.loadingStatus = 0;
                $scope.sweetLeadsData = [];
                $scope.recordIds = [];
                // $scope.subscribedDataSourceParams.forEach(function(item) {
                //   if(item.plan.nickname.indexOf("Google")>=0)
                //     timerIndex = 500;
                //   else if(item.plan.nickname.indexOf("Four")>=0)
                //     timerIndex = 250;
                // })
                console.log(apiCallPositionList);
                $scope.progressInterval = $interval(function() {
                  if (apiCallCount >= timerIndex) {
                    $scope.loadingStatus++;
                    $scope.progressStop();
                    $scope.showSearchData();
                    return;
                  } else {
                    $scope.loadingStatus+=0.0002;
                    $scope.progressWidth.width = ($scope.loadingStatus / timerIndex * 100) +'%';
                    if(!$scope.loading) {
                      $scope.loading = true;
                      $scope.reqModel.position = apiCallPositionList[apiCallCount];
                      $scope.reqModel.position.originalData = $scope.recordIds;
                      searchService.getSweetLeads($scope.reqModel, { active: $scope.subscribedDataSourceParams, inactive: [] }).then(
                          function(response) {
                              $scope.loading = false;
                              let rowNumber = 0;
                              apiCallCount++;
                              $scope.loadingStatus = apiCallCount;
                              // setTimeout(function() {
                              //   $scope.loadingStatus = timerIndex;
                              //   $scope.progressWidth.width = '100%';
                              //   $scope.progressStop();
                              // }, 50);
                              // $scope.sweetLeadsData = response.active.map(item => {
                              //     item.rowNumber = rowNumber++;
                              //     item.active = true;
                              //     return item;
                              // })
                              for(var i = 0; i < response.active.length; i++) {
                                let record = response.active[i];
                                record.rowNumber = rowNumber++;
                                record.active = true;
                                $scope.sweetLeadsData.push(record);
                                $scope.recordIds.push(response.active[i].detail.id);
                              }
                          }, function(error) {
                              console.log(error);
                          }, function(progress) {
                              console.log(progress);
                          });
                    }
                  }
                }, 20);
            };

            $scope.disconnectDataSource = (res) => {
                res.active = !res.active;
                $scope.availableDataSourceParams.push(res);
                $scope.subscribedDataSourceParams = $scope.subscribedDataSourceParams.filter(source => source != res);
                $scope.reqModel.dataSources = _.map($scope.subscribedDataSourceParams, 'id');
                $scope.sweetLeadsData = [];
                $scope.sweetLeadsParams = new NgTableParams({}, { dataset: [], counts: [] });
                $scope.getSearchResults();
            }

            $scope.checkAvailable = (res) => {
                let isExisting = $scope.subscribedDataSourceParams.filter(source => source.title.indexOf('D&B')>=0);
                if($scope.subscribedDataSourceParams.length == 0)
                  return true;

                if(isExisting.length > 0) {
                    return false;
                } else {
                  if(res.title.indexOf('D&B') >= 0)
                    return false;
                  else
                    return true;
                }
            }

            $scope.toggleDataSource = (res) => {
                res.active = !res.active;
                $scope.getSearchResults();
            }

            $scope.activateDataSource = (res) => {
                $scope.availableDataSourceParams.forEach(one => {
                    one.active = false;
                    if(one.title.toLowerCase().indexOf("yelp")>=0) {
                      one.logos = "/images/logos/yelp_logo.png";
                    } else if(one.title.toLowerCase().indexOf("google")>=0) {
                      one.logos = "/images/logos/google_logo.png";
                    } else if(one.title.toLowerCase().indexOf("foursquare")>=0) {
                      one.logos = "/images/logos/foursquare_logo.png";
                    } else if(one.title.toLowerCase().indexOf("experian")>=0) {
                      one.logos = "/images/logos/experian_logo.png";
                    }
                });
                res.active = true;
                // $scope.subscribedDataSourceParams.push(res);
                // $scope.availableDataSourceParams = $scope.availableDataSourceParams.filter(source => source != res);
                // $scope.reqModel.dataSources = _.map($scope.subscribedDataSourceParams, 'id');
                $scope.reqModel.dataSources = [res.id];
                if(res.title.toLowerCase().indexOf("yelp")>=0) {
                  res.logos = "/images/logos/yelp_color_logo.png";
                } else if(res.title.toLowerCase().indexOf("google")>=0) {
                  res.logos = "/images/logos/google_color_logo.png";
                } else if(res.title.toLowerCase().indexOf("foursquare")>=0) {
                  res.logos = "/images/logos/foursquare_color_logo.png";
                } else if(res.title.toLowerCase().indexOf("experian")>=0) {
                  res.logos = "/images/logos/experian_color_logo.png";
                }
                // $scope.getSearchResults();
            }

            $scope.showBlur = (res) => {
                return 'blur';
            }

            // function addSubCategory(industryList) {
            //     industryList.unshift({alias: "sub industry", title: "Sub Industry"});
            // }

            // function addStateCategory(industryList) {
            //     industryList.unshift({alias: "state", title: "State"});
            // }

            $scope.remove = function (id) {
                _.remove($rootScope.reqModel.dataSources, source => {
                    return source == id;
                });
                _.remove($scope.subscribedDataSourceParams.data, record => {
                    return record.id == id;
                });
            };

            $scope.addToinputKeywordTags = function (tag) {
                $scope.inputKeywordTags.push(tag);
                $scope.getSuggestedTags("");
            };

            $scope.getSuggestedTags = function (tag) {
                // a tag changed... lets get new suggested tags...
                let tagString = "";
                if ($scope.inputKeywordTags.length === 0) {
                    $scope.suggestedTags = [];
                    return;
                }

                $scope.inputKeywordTags.forEach(one => {
                    tagString = tagString + one.text + " ";
                });

                searchService.getSuggestedTags(tagString).then(res => {
                    $scope.suggestedTags = res;
                }).catch(err => {
                    console.error(err);
                    $scope.suggestedTags = [];
                });
                $scope.getSearchResults();
            };

            // this methods loads data in the subscription tables.
            function bindData() {
                loginService.getUser().then(user => {
                    $scope.state = user.state;
                    $scope.stripeId = user.stripeId;
                    $scope.userCoupons = user.coupons ? user.coupons : [];
                    $scope.credits = user.credit;
                    if($scope.stripeId)
                      $scope.getStripeInfo();
                    if($scope.state)
                      $scope.getTaxInfo();
                });
                dataSourcesService.getAll()
                    .then(res => {
                        res.sort((a, b) => (a.title < b.title) ? 1 : -1)
                        res = _.filter(res, function(source){ return source.title.indexOf('Google') >= 0 || source.title.indexOf('Yelp') >= 0 || source.title.indexOf('FourSquare') >= 0 ||  source.title.indexOf('Experian') >= 0; });
                        let subscribed = _.filter(res, { subscribed: true });

                        let userInfo = authorizedService.getUserInfo();

                        //$scope.hasSubscriptions = subscribed.length > 0;
                        let available = _.filter(res, { subscribed: false });
                        available.forEach(one => {
                            one.action = "/api/payments/new/" + one.id + "/" + userInfo.id;
                            one.active = false;
                            if(one.title.toLowerCase().indexOf("yelp")>=0) {
                              one.logos = "/images/logos/yelp_logo.png";
                            } else if(one.title.toLowerCase().indexOf("google")>=0) {
                              one.logos = "/images/logos/google_logo.png";
                            } else if(one.title.toLowerCase().indexOf("foursquare")>=0) {
                              one.logos = "/images/logos/foursquare_logo.png";
                            } else if(one.title.toLowerCase().indexOf("experian")>=0) {
                              one.logos = "/images/logos/experian_logo.png";
                            }
                        });

                        $scope.subscribedDataSourceParams = subscribed;//new NgTableParams({}, {dataset: subscribed, counts: []});
                        $scope.availableDataSourceParams = available;//new NgTableParams({}, {dataset: available, counts: []});

                        setTimeout(function() {
                          var input = document.getElementById('SelectedLocation');
                          console.log(input);
                          var autocompleteFrom = new google.maps.places.Autocomplete(input);
                          google.maps.event.addListener(autocompleteFrom, 'place_changed', function() {
                              var place = autocompleteFrom.getPlace();
                              $scope.position.lat = place.geometry.location.lat();
                              $scope.position.lng = place.geometry.location.lng();
                              $scope.position.isSelected = true;
                              $scope.$apply();
                          });

                          navigator.geolocation.getCurrentPosition(function(pos) {
                              // $scope.position.lat = pos.coords.latitude;
                              // $scope.position.lng = pos.coords.longitude;
                          },
                          function(error) {
                              alert('Unable to get location: ' + error.message);
                          }, { enableHighAccuracy: true });
                        }, 100)

                    }).catch(err => {
                        console.error(err);
                    });
            }

            $scope.priceSelect = (test) => {

                $scope.selectedPeriod = test;
                // find which one was selected... find the amount... and multiply by 100.
                if ($scope.selectedPeriod === 'Year') {
                    let cost = $scope.availableDataSourceParams.data ? $scope.availableDataSourceParams.data[0].prices.year : 0;

                    $scope.valueInCents = cost * 100;
                    $scope.valuePerMonth = (cost * 100) / 12;
                    $rootScope.selectedCostPerYear = cost;
                    $rootScope.selectedCostPerMonth = cost / 12;

                } else if ($scope.selectedPeriod === 'Month') {

                    let cost = $scope.availableDataSourceParams.data[0].prices.month;

                    $scope.valueInCents = cost * 100;
                    $rootScope.selectedCostPerYear = cost * 12;
                    $rootScope.selectedCostPerMonth = cost;
                }

            };

            $scope.confectioneryNext = () => {
                if (!$scope.projectName) {
                    // $scope.showAlert = true;
                    $scope.saveErrorMessage = "Project Name is required.";
                    // alert("Project Name is required.");
                    return;
                }
                if ($scope.subscribedDataSourceParams.length == 0) {
                    // $scope.showAlert = true;
                    $scope.saveErrorMessage = "Active Data Source is required.";
                    // alert("Active Data Source is required.");
                    return;
                }

                $rootScope.reqModel.inputKeywordTags = $scope.inputKeywordTags;
                angular.forEach($scope.sweetLeadsData, function (item) {
                    item.selected = $scope.checkboxes.items[item.rowNumber];
                });

                $rootScope.reqModel.selectedRows = _.filter($scope.sweetLeadsData, 'selected');
                $rootScope.reqModel.projectName = $scope.projectName;
                $rootScope.reqModel.hasSubscriptions = $scope.hasSubscriptions;

                $cookies.putObject("reqModel", $rootScope.reqModel);
                $location.path('/edit');
            };

            // watch for check all checkbox
            $scope.$watch('checkboxes.checked', function (value) {
                angular.forEach($scope.sweetLeadsData, function (item) {
                    if (angular.isDefined(item.rowNumber)) {
                        $scope.checkboxes.items[item.rowNumber] = value;
                    }
                });
            });

            // watch for data checkboxes
            $scope.$watch('checkboxes.items', function (values) {
                if (!$scope.sweetLeadsData) {
                    return;
                }
                var checked = 0, unchecked = 0,
                    total = $scope.sweetLeadsData.length;
                angular.forEach($scope.sweetLeadsData, function (item) {
                    checked += ($scope.checkboxes.items[item.rowNumber]) || 0;
                    unchecked += (!$scope.checkboxes.items[item.rowNumber]) || 0;
                });
                if ((unchecked == 0) || (checked == 0)) {
                    if($scope.checkboxes)
                        $scope.checkboxes.checked = (checked == total && checked > 0);
                }
                $scope.hasSelections = checked > 0;
                // grayed checkbox
                angular.element(document.getElementById("select_all")).prop("indeterminate", (checked != 0 && unchecked != 0));

                if($scope.checkboxes)
                  $scope.calculatePrice();
            }, true);

            //watch for industry or location changes
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

            $scope.addProject = function () {
              $scope.hasSubscriptions = true;
              $scope.subscribedDataSourceParams.forEach(source => source.subscribed = true);
              $scope.sweetLeadsData.forEach(item => item.active = true);
              $scope.reqModel._id = $scope.selectedProjectId?$scope.selectedProjectId:"";
              $scope.reqModel.projectName = $scope.projectName?$scope.projectName:"";
              if($scope.reqModel._id) {
                  projectListService.save(
                      {
                          name: $scope.listName,
                          projectId: $scope.reqModel._id,
                          city: $scope.reqModel.city,
                          term: $scope.reqModel.term,
                          dataSources: $scope.reqModel.dataSources,
                          state: $scope.reqModel.state,
                          entries: $scope.reqModel.selectedRows
                      }).then(projectList => {
                      if (projectList.status === "error"){
                          // $scope.saveError = true;
                          $scope.saveErrorMessage = projectList.message;
                      }
                      else if (projectList) {
                          if($scope.calculatedRates.discount > 0) {
                            $scope.userCoupons.push({id:$scope.calculatedRates.coupon.id, name: $scope.calculatedRates.coupon.name})
                            loginService.updateCoupon($scope.userCoupons).then(response => {
                              $location.path('/projects');
                            });
                          } else
                            $location.path('/projects');
                      } else {
                          // Show alert that it didn't save
                      }
                  });
              } else {
                projectService.save($scope.reqModel).then(project => {
                    let projectId = project._id;
                    projectListService.save(
                        {
                            name: $scope.listName,
                            projectId: projectId,
                            city: $scope.reqModel.city,
                            term: $scope.reqModel.term,
                            dataSources: $scope.reqModel.dataSources,
                            state: $scope.reqModel.state,
                            entries: $scope.reqModel.selectedRows
                        }).then(projectList => {
                        if (projectList.status === "error"){
                            // $scope.saveError = true;
                            $scope.saveErrorMessage = projectList.message;
                        }
                        else if (projectList) {
                            // show alert that save was success!
                            // $scope.saveError = false;
                            // $scope.showAlert = false;
                            $scope.saveErrorMessage = "";
                            $scope.alertMessage = "Success! Your list is saved.";
                            $rootScope.reqModel = {};
                            $cookies.putObject("reqModel", $rootScope.reqModel);
                            $scope.showSuccess = true;

                            if($scope.calculatedRates.discount > 0) {
                              $scope.userCoupons.push({id:$scope.calculatedRates.coupon.id, name: $scope.calculatedRates.coupon.name})
                              loginService.updateCoupon($scope.userCoupons).then(response => {
                                $location.path('/projects');
                              });
                            } else
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
            }

            $scope.openPayment = function () {
                if ($scope.showAlert) {
                  return;
                }
                // if (!$scope.projectName) {
                //     $scope.saveErrorMessage = "Project Name is required.";
                //     return;
                // }
                //
                // if (!$scope.listName) {
                //     $scope.saveErrorMessage = "List Name is required.";
                //     return;
                // }

                if ($scope.subscribedDataSourceParams.length == 0) {
                    $scope.saveErrorMessage = "Active Data Source is required.";
                    // alert("Active Data Source is required.");
                    return;
                }

                $scope.reqModel.inputKeywordTags = $scope.inputKeywordTags;
                angular.forEach($scope.sweetLeadsData, function (item) {
                    item.selected = $scope.checkboxes.items[item.rowNumber];
                });

                $scope.reqModel.selectedRows = _.filter($scope.sweetLeadsData, 'selected');
                // $scope.reqModel.projectName = $scope.projectName;
                if($scope.reqModel.selectedRows.length == 0) {
                  $scope.saveErrorMessage = "No records are selected.";
                  return;
                }

                $scope.saveErrorMessage = "";
                let modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: '/confectionery/projectModal.html',
                    controller: function ($uibModalInstance) {
                        $scope.closeModal = function () {
                            $uibModalInstance.dismiss();
                        }
                        $scope.processPayment = function () {
                            $scope.selectedProjectId = $("#selectedProjectId").val();
                            $scope.projectName = $("#projectName").val();
                            $scope.listName = $("#listName").val();
                            if(!$scope.selectedProjectId && !$scope.projectName) {
                                $scope.couponErrorMessage = "Please select project or type new project name.";
                                return;
                            }
                            if(!$scope.listName) {
                              $scope.couponErrorMessage = "Please type new list name.";
                              return;
                            }
                            $uibModalInstance.close(true);
                        }

                    },
                    controllerAs: 'scope',
                    scope: $scope
                });

                // $location.path('/edit');
                // let modalInstance = $uibModal.open({
                //     animation: $scope.animationsEnabled,
                //     ariaLabelledBy: 'modal-title',
                //     ariaDescribedBy: 'modal-body',
                //     templateUrl: '/confectionery/checkoutModal.html',
                //     controller: function ($uibModalInstance) {
                //         $scope.paymentProcessed = false;
                //         $scope.closePayment = function () {
                //             $uibModalInstance.dismiss();
                //         }
                //         $scope.updateCoupon = function() {
                //           if(!$("#couponCode").val()) {
                //             $scope.calculatedRates.discount = 0;
                //             $scope.couponErrorMessage = "";
                //             $scope.calculatePrice();
                //             return;
                //           }
                //           $scope.couponCode = $("#couponCode").val();
                //           let coupons = _.filter($scope.coupons, function(coupon) { return coupon.name == $scope.couponCode && coupon.valid; });
                //           if(coupons.length > 0) {
                //             if(coupons[0].duration == "once") {
                //               let temp = _.filter($scope.userCoupons, function(coupon) { return coupon.id == coupons[0].id })
                //               if(temp.length > 0) {
                //                 $scope.calculatedRates.discount = 0;
                //                 $scope.couponErrorMessage = "You have already used this coupon before.";
                //                 $scope.calculatePrice();
                //               } else {
                //                 $scope.calculateCoupon(coupons[0]);
                //               }
                //             } else {
                //               $scope.calculateCoupon(coupons[0]);
                //             }
                //           } else {
                //             $scope.calculatedRates.discount = 0;
                //             $scope.couponErrorMessage = "Your coupon code is invalid.";
                //             $scope.calculatePrice();
                //           }
                //         }
                //         $scope.processPayment = function () {
                //             $scope.selectedProjectId = $("#selectedProjectId").val();
                //             $scope.projectName = $("#projectName").val();
                //             $scope.listName = $("#listName").val();
                //             if(!$scope.selectedProjectId && !$scope.projectName) {
                //                 $scope.couponErrorMessage = "Please select project or type new project name.";
                //                 return;
                //             }
                //             if(!$scope.listName) {
                //               $scope.couponErrorMessage = "Please type new list name.";
                //               return;
                //             }
                //             $scope.couponErrorMessage = "";
                //             $scope.reqModel._id = $scope.selectedProjectId?$scope.selectedProjectId:"";
                //             $scope.reqModel.projectName = $scope.projectName?$scope.projectName:"";
                //             let data = {
                //               customerId: $scope.stripeId,
                //               totalPrice: parseInt($scope.calculatedRates.total*100)
                //             }
                //             if($scope.stripeInfo.sources.data.length==0)
                //               data.token = response.id;
                //             $http.post('/api/stripePayment/createCharges', data,
                //               {
                //                 headers: {
                //                   Authorization: authorizedService.returnAuthHeader()
                //                 }
                //               }).then((res) => {
                //                 if (res.data.status == 'success') {
                //                     $uibModalInstance.close(true);
                //                 }
                //               });
                //         }
                //         this.stripeCallback = function (status, response) {
                //             if (response.error) {
                //                 // there was an error. Fix it.
                //                 $scope.couponErrorMessage = "Your card information is invalid.";
                //             } else {
                //                 $scope.couponErrorMessage = "";
                //                 $scope.selectedProjectId = $("#selectedProjectId").val();
                //                 $scope.projectName = $("#projectName").val();
                //                 $scope.listName = $("#listName").val();
                //                 if(!$scope.selectedProjectId && !$scope.projectName) {
                //                     $scope.couponErrorMessage = "Please select project or type new project name.";
                //                     return;
                //                 }
                //                 if(!$scope.listName) {
                //                   $scope.couponErrorMessage = "Please type new list name.";
                //                   return;
                //                 }
                //
                //                 $scope.reqModel._id = $scope.selectedProjectId?$scope.selectedProjectId:"";
                //                 $scope.reqModel.projectName = $scope.projectName?$scope.projectName:"";
                //
                //                 let data = {
                //                   customerId: $scope.stripeId,
                //                   totalPrice: parseInt($scope.calculatedRates.total*100)
                //                 }
                //                 if($scope.stripeInfo.sources.data.length==0)
                //                   data.token = response.id;
                //                 $http.post('/api/stripePayment/createCharges', data,
                //                   {
                //                     headers: {
                //                       Authorization: authorizedService.returnAuthHeader()
                //                     }
                //                   }).then((res) => {
                //                     if (res.data.status == 'success') {
                //                         $uibModalInstance.close(true);
                //                     }
                //                   });
                //             }
                //         };
                //     },
                //     controllerAs: 'scope',
                //     scope: $scope
                // });
                modalInstance.result.then(res => {
                    if (res === true) {
                      $scope.addProject();
                      // if(!$scope.calculatedRates.discount>0 && ($scope.getSugarCash($scope.calculatedRates.total) > 0 || $scope.calculatedRates.sugarcash > 0)) {
                      //   if($scope.calculatedRates.sugarcash > 0)
                      //     $scope.credits.push({amount: $scope.calculatedRates.sugarcash * (-1), description: $scope.reqModel.projectName + " - " + $scope.reqModel.state + " - " + $scope.reqModel.term})
                      //   if($scope.getSugarCash($scope.calculatedRates.total) > 0)
                      //     $scope.credits.push({amount: $scope.getSugarCash($scope.calculatedRates.total), description: $scope.reqModel.projectName + " - " + $scope.reqModel.state + " - " + $scope.reqModel.term})
                      //   loginService.updateCredit($scope.credits).then(response => {
                      //     $scope.addProject();
                      //   });
                      // } else {
                      //   $scope.addProject();
                      // }
                    }
                });
            }
        }]);
