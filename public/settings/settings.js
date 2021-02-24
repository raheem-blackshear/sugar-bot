
angular.module('sweetLeads.settings', ['ngTable'])

  .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/settings', {
          templateUrl: 'settings/settings.html',
          controller: 'settingsCtrl',
          resolve: {
              'auth': (authorizedService) => {
                  localStorage.removeItem('selectedProject');
                  return authorizedService.authenticate();
              }
          }
      });
  }])

  .controller('settingsCtrl', ['loginService','$location','dataSourcesService', 'dataService', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService','$cookies','searchService', '$uibModal', 'projectListService',
    function (loginService, $location, dataSourcesService, dataService, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies, searchService, $uibModal, projectListService) {
        $scope.states = $rootScope.states;
        $scope.logo = '';
        $scope.fullName = '';
        $scope.dateOfBirth = '';
        $scope.phoneNumber = '';
        $scope.company = '';
        $scope.address = '';
        $scope.city = '';
        $scope.zipcode = '';
        $scope.affiliation = '';
        $scope.state = '';
        $scope.stripeId = '';
        $scope.activeTab = $rootScope.activeTab?$rootScope.activeTab:'Profile';
        $rootScope.activeTab = '';
        $scope.statesSelect = {};
        $scope.updatingProfile = false;
        $scope.updating = false;
        $scope.updatingPassword = false;
        $scope.updatingCRM = false;
        $scope.updatingInvoices = false;
        $scope.updatingPayment = false;
        $scope.subscriptions = null;
        $scope.oldPassword = '';
        $scope.stripeInfo = null;
        $scope.invoices = [];
        $scope.charges = [];
        $scope.taxrate = null;
        $scope.subscriptionDataSources = [];
        $scope.subscriptionSaveSuccessMessage = '';
        $scope.errorMessage = '';
        $scope.totalRecords = 0;
        $scope.credits = [];


        $scope.profileUpdate = function() {
            $scope.updating = true;
            $scope.updatingProfile = true;
            $scope.changedLogo = $scope.logo;
            $scope.changedFullName = $scope.fullName;
            $scope.changedCompany = $scope.company;
            $scope.changedPhoneNumber = $scope.phoneNumber;
            $scope.changedEmailAddress = $scope.emailAddress;
            $scope.changedDateOfBirth = $scope.dateOfBirth;
            $scope.changedState = $scope.state;
            $scope.changedCity = $scope.city;
            $scope.changedAddress = $scope.address;
            $scope.changedZipcode = $scope.zipcode;
            $scope.changedAffiliation = $scope.affiliation;
        }
        $scope.getTaxInfo = function () {
          $http.get('/api/stripePayment/getTaxrates',
            {
              headers: {
                Authorization: authorizedService.returnAuthHeader()
              }
            }).then((res) => {
              if (res.data.status == 'success') {
                  $scope.taxrate = _.filter(res.data.data.data, function(tax) { return tax.jurisdiction == $scope.states[$scope.state] && tax.active; });
              }
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
                    $scope.subscriptions = _.filter($scope.stripeInfo.subscriptions.data, function(source){ return source.plan && source.plan.nickname.indexOf('Subscription') >= 0; });
                }
              });
            $http.post('/api/stripePayment/getInvoices',
              {
                customerId: $scope.stripeId
              }, {
                headers: {
                  Authorization: authorizedService.returnAuthHeader()
                }
              }).then((res) => {
                if (res.data.status == 'success') {
                    $scope.invoices = res.data.data.data;
                }
              });
            $http.post('/api/stripePayment/getCharges',
              {
                customerId: $scope.stripeId
              }, {
                headers: {
                  Authorization: authorizedService.returnAuthHeader()
                }
              }).then((res) => {
                if (res.data.status == 'success') {
                    $scope.charges = res.data.data.data;
                }
              });
        }

        $scope.removeMethod = function(source) {
          $http.post('/api/stripePayment/removeMethod',
            {
              customerId: $scope.stripeId,
              sourceId: source.id
            }, {
              headers: {
                Authorization: authorizedService.returnAuthHeader()
              }
            }).then((res) => {
              if (res.data.status == 'success') {
                  $scope.getStripeInfo();
              }
            });
        }

        bindData();
        // this methods loads data in the subscription tables.
        function bindData() {
            dataSourcesService.getAll()
                .then(res => {
                    $scope.subscriptionDataSources = _.filter(res, function(source){ return source.title.indexOf('Subscription') >= 0 && source.price > 0; });
                }).catch(err => {
                console.error(err);
            });

            projectListService.getAll().then (response=>{
                $scope.totalRecords = 0;
                response.forEach(function(list) {
                  $scope.totalRecords += list.entries.length;
                })
            }).catch (err=> {
                console.error(err);
            })
        }

        $scope.showPasswordAlert = false;
        $scope.showPasswordMatchError = false;
        $scope.showPasswordLengthError = false;
        $scope.showAlert = false;
        $scope.crmShowAlert = false;
        loginService.getUser().then(user => {
            $scope.logo = user.logo;
            $scope.fullName = user.fullName;
            //$scope.fullName = $scope.fullName == undefined ? "Davit Clark" : $scope.fullName;
            $scope.company = user.company;
            $scope.state = user.state;
            $scope.city = user.city;
            $scope.address = user.address;
            $scope.zipcode = user.zipcode;
            //$scope.company = $scope.company == undefined ? 'RobotSalesNarr' : $scope.company;
            // console.log($scope.fullName);
            $scope.emailAddress = user.emailAddress;
            $scope.affiliation = user.affiliation;
            $scope.phoneNumber = user.phoneNumber;
            $scope.passwordConfirm = "";
            if (user.integrations && user.integrations.pardot) {
                $scope.pardotEmail = user.integrations.pardot.email;
                $scope.pardotKey = user.integrations.pardot.userKey;
                $scope.pardotPassword = user.integrations.pardot.password;
            }
            let dob =user.dateOfBirth ? (new Date(user.dateOfBirth)) : null;
            $scope.stripeId = user.stripeId ? user.stripeId : null;
            $scope.dateOfBirth = dob;
            $scope.credits = user.credit;
            $scope.sweetLeadsParams = new NgTableParams({}, { dataset: $scope.credits, counts: [] });
            if($scope.stripeId)
              $scope.getStripeInfo();
            if($scope.state)
              $scope.getTaxInfo();
        });

        $scope.profileSubmit = function() {
            $scope.showAlert = false;
            $scope.logo = $scope.changedLogo;
            $scope.fullName = $scope.changedFullName;
            $scope.company = $scope.changedCompany;
            $scope.phoneNumber = $scope.changedPhoneNumber;
            $scope.emailAddress = $scope.changedEmailAddress;
            $scope.dateOfBirth = $scope.changedDateOfBirth;
            $scope.state = $scope.changedState;
            $scope.city = $scope.changedCity;
            $scope.address = $scope.changedAddress;
            $scope.zipcode = $scope.changedZipcode;
            $scope.affiliation = $scope.changedAffiliation;

            loginService.updateProfile({
                logo: $scope.logo,
                fullName: $scope.fullName,
                company: $scope.company,
                state: $scope.state,
                city: $scope.city,
                address: $scope.address,
                zipcode: $scope.zipcode,
                affiliation: $scope.affiliation,
                phoneNumber: $scope.phoneNumber,
                emailAddress: $scope.emailAddress,
                dateOfBirth: $scope.dateOfBirth
            }).then(response => {
                $scope.showAlert = true;
                $scope.updating = false;
                $scope.updatingProfile = false;
            });
        };

        $scope.pardotSubmit = function() {
            $scope.crmShowAlert = false;
            loginService.updatePardot(
                $scope.pardotEmail,
                $scope.pardotKey,
                $scope.pardotPassword
            ).then(response => {
                $scope.crmShowAlert = true;
            });
        };


        $scope.dismissAlert = function() {
            $scope.showAlert = false;
        };

        $scope.crmDismissAlert = function() {
            $scope.crmShowAlert = false;
        };

        $scope.passwordUpdate = function() {
            $scope.updating = true;
            $scope.updatingPassword = true;
            $scope.showPasswordAlert = false;
            $scope.showPasswordMatchError = false;
            $scope.showPasswordLengthError = false;
            $scope.saveError = false;
            $scope.password = "";
            $scope.passwordNew = "";
            $scope.passwordConfirm = "";
        }

        $scope.comingUpdate = function(para){
            $scope.updating = true;
            if(para == 'CRM'){
                $scope.updatingCRM = true;
            }
            else if(para == 'Invoices'){
                $scope.updatingInvoices = true;
            }
            else if(para == 'Payment'){
                $scope.updatingPayment = true;
            }
        }
        $scope.backToAccount = function(){
            $scope.updating = false;
            $scope.updatingCRM = false;
            $scope.updatingInvoices = false;
            $scope.updatingPayment = false;
            $scope.updatingProfile = false;
            $scope.updatingPassword = false;
        }

        $scope.passwordSubmit = function() {
            let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
            $scope.showPasswordAlert = false;
            $scope.showPasswordMatchError = false;
            $scope.showPasswordLengthError = false;
            $scope.saveError = false;
            //compare encrypted info?
            if (strongRegex.test($scope.passwordNew) && $scope.passwordNew === $scope.passwordConfirm) {
                loginService.updatePassword({
                    oldPassword: $scope.password,
                    password: $scope.passwordConfirm
                }).then(res => {
                    if(res.status === "error") {
                        $scope.showPasswordMatchError = true;
                        return;
                    }
                    $scope.showPasswordAlert = true;
                    // $scope.updating = false;
                    // $scope.updatingPassword = false;
                }).catch(err => {
                    $scope.saveError = true;
                    $scope.saveErrorMessage = "Unable to save.";
                })
            } else if ($scope.passwordNew !== $scope.passwordConfirm) {
                $scope.showPasswordMatchError = true;
            } else {
                $scope.showPasswordLengthError = true;
            }
        };

        $scope.dismissAlert = function() {
            $scope.showAlert = false;
            $scope.showPasswordMatchError = false;
            $scope.showPasswordLengthError = false;
            $scope.showPasswordAlert = false;
        }

        $scope.openMethodModal = function(subscription) {
          let modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: '/settings/methodModal.html',
              controller: function ($uibModalInstance) {
                  $scope.closePayment = function () {
                      $uibModalInstance.close(false);
                  }
                  this.stripeCallback = function (status, response) {
                      if (response.error) {
                          // there was an error. Fix it.
                          // alert(typeof (response.error) === 'string' ? response.error : 'Stripe error');
                          $scope.errorMessage = "Your card information is invalid.";
                      } else {
                        $scope.errorMessage = '';
                        if(subscription) {
                          subscription = {
                            token: response.id,
                            customerId: $scope.stripeId,
                            plan: subscription.plan,
                            taxId: subscription.taxId
                          }
                          $uibModalInstance.close(true);
                          $scope.confirmModal(subscription);
                        } else {
                          $http.post('/api/stripePayment/addPaymentMethod',
                            {
                              token: response.id,
                              email: $scope.emailAddress,
                              customerId: $scope.stripeId
                            }, {
                              headers: {
                                Authorization: authorizedService.returnAuthHeader()
                              }
                            }).then((res) => {
                              if (res.data.status == 'success') {
                                  $uibModalInstance.close(true);
                              }
                            });
                        }
                      }
                  };
              },
              controllerAs: 'scope',
              scope: $scope
          });
          modalInstance.result.then(res => {
              if (res === true) {
                  $scope.getStripeInfo();
              }
          });
        }

        $scope.confirmModal = function (subscription) {
          $uibModal.open({
            templateUrl: '/settings/confirmModal.html',
            controller: function ($scope, $uibModalInstance) {
              if(subscription)
                $scope.confirmMessage = "Are you sure you want to 'Go Pro', you will be billed immediately.";
              else
                $scope.confirmMessage = "Are you sure you want to close your account?";
              $scope.ok = function () {
                if(subscription) {
                  $http.post('/api/stripePayment/createSubscription', subscription,
                    {
                      headers: {
                        Authorization: authorizedService.returnAuthHeader()
                      }
                    }).then((res) => {
                      $scope.subscriptionSaveSuccessMessage = "Subscription has been processed";
                      if (res.data.status == 'success') {
                          $scope.getStripeInfo();
                          $uibModalInstance.close();
                      }
                    });
                } else {
                  loginService.close();
                }
              };
              $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
              };
            },
            controllerAs: 'scope',
            scope: $scope
          })
        }

        $scope.goPro = function () {
          $(".nav-justified").find('a')[2].click();
        }

        $scope.cancelLogo = function() {
          $scope.changedLogo = "";
        }

        $scope.previewLogo = function(e) {
            var reader = new FileReader();
            reader.onload = function (e) {
                $http.post('/api/users/upload/image',
                  {
                    image: e.target.result
                  }, {
                    headers: {
                      Authorization: authorizedService.returnAuthHeader()
                    }
                  }).then((res) => {
                    $scope.changedLogo = res.data.url;
                  });
            };

            reader.readAsDataURL(e.target.files[0]);
        }

        $scope.seletSubscription = function (flag) {
            if(flag==1) {
              if($scope.stripeInfo.sources.data.length==0) {
                  let subscription = {
                    plan: [{plan: $scope.subscriptionDataSources[0].plan.id}],
                    taxId: $scope.taxrate[0].id
                  };
                  $scope.openMethodModal(subscription);
              } else {
                  let subscription = {
                    customerId: $scope.stripeId,
                    plan: [{plan: $scope.subscriptionDataSources[0].plan.id}],
                    taxId: $scope.taxrate[0].id
                  }
                  $scope.confirmModal(subscription);
              }
            } else {
              $http.post('/api/stripePayment/removeSubscription',
                {
                  subscriptionId: $scope.subscriptions[0].id
                }, {
                  headers: {
                    Authorization: authorizedService.returnAuthHeader()
                  }
                }).then((res) => {
                  $scope.subscriptionSaveSuccessMessage = "Subscription has been processed";
                  if (res.data.status == 'success') {
                      $scope.getStripeInfo();
                  }
                });
            }

        }

        $scope.closeAccount = function() {
            $scope.confirmModal(null);
        }
  }]);
