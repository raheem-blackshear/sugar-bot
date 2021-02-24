angular.module('sweetLeads.blaster', ['ngTable'])

  .config(['$routeProvider', function ($routeProvider) {
      $routeProvider.when('/blaster', {
          templateUrl: 'blaster/blaster.html',
          controller: 'blasterCtrl',
          resolve: {
              'auth': (authorizedService) => {
                  return authorizedService.authenticate();
              }
          }
      });
  }])

  .controller('blasterCtrl', ['textAngularManager', 'loginService', 'projectService', 'projectListService', 'templateService', '$location','dataSourcesService', 'dataService', '$window', '$scope', '$rootScope', '$http', 'NgTableParams', 'authorizedService','$cookies','searchService', '$uibModal',
    function (textAngularManager, loginService, projectService, projectListService, templateService, $location, dataSourcesService, dataService, $window, $scope, $rootScope, $http, NgTableParams, authorizedService, $cookies,searchService, $uibModal) {
        $scope.cropper = '';
        $scope.template = {
          name: '',
          projectId: '',
          subject: '',
          html: '',
          datetime: '',
          sender: '',
          active: false
        };
        $scope.letterTemplate = {
          metadata: {
            name: '',
            datetime: '',
            type: 'Letter',
            projectId: '',
            address: ''
          },
          description: '',
          html: '',
        }
        console.log('template', $scope.letterTemplate)
        $scope.postcardTemplate = {
          metadata: {
            name: '',
            datetime: '',
            type: 'Postcard',
            projectId: '',
            address: ''
          },
          description: '',
          html: '',
        }
        $scope.stripeId = '';
        $scope.user = null;
        $scope.letterLogo = '';
        $scope.postcardFront = '';
        $scope.stripeInfo = null;
        $scope.selectedTemplateId = "";
        $scope.templates = [];
        $scope.postcardTemplates = [];
        $scope.letterTemplates = [];
        $scope.selectedTemplate = {};
        $scope.subscriptions = null;
        $scope.taxrate = null;
        $scope.startDate = moment();
        $scope.alertMessage = '';
        $scope.successMessage = '';
        $scope.blasterSources = [];
        $scope.selectedProject = null;
        $scope.showEmailTab = false;
        $scope.maxSugarCash = $rootScope.sugarcash;
        $scope.sugarCash = "$0.00";
        $scope.credits = [];
        $scope.calculatedRates = {
          'type': 'Email',
          'totalCount': 0,
          'unitPrice': 0,
          'price': 0,
          'tax': 0,
          'total': 0,
          'discount': 0,
          'sugarcash': 0
        };
        if(localStorage.getItem('selectedProject')) {
          $scope.selectedProject = JSON.parse(localStorage.getItem('selectedProject'));
          for(var i = 0; i < $scope.selectedProject.entries.length; i++)
            if($scope.selectedProject.entries[i].email) {
              $scope.showEmailTab = true;
              break;
            }
          localStorage.removeItem('selectedProject');
        // } else {
        //   $scope.showEmailTab = true;
        }

        loginService.getUser().then(user => {
            $scope.stripeId = user.stripeId ? user.stripeId : null;
            $scope.user = user;
            $scope.template.sender = $scope.user.emailAddress;
            $scope.letterLogo = user.logo;
            $scope.credits = user.credit;
            if($scope.stripeId)
              $scope.getStripeInfo();
            if($scope.user.state)
              $scope.getTaxInfo();
            $scope.getTemplates();
        });

        dataSourcesService.getAll().then(res => {
            $scope.blasterSources = _.filter(res, function(source){ return source.title.indexOf('Blaster') >= 0 || source.title.indexOf('Lob') >= 0; });
        });

        projectService.getAll().then(response => {
            $scope.projectTable = response.sort(function(a, b){
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
                  $scope.subscriptions = _.filter($scope.stripeInfo.subscriptions.data, function(source){ return source.plan.nickname.indexOf('Subscription') >= 0; });
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
                  $scope.taxrate = _.filter(res.data.data.data, function(tax) { return tax.jurisdiction == $rootScope.states[$scope.user.state] && tax.active; });
              }
            });
        }

        $scope.upgrade = function () {
            $rootScope.activeTab = "Subscriptions";
            $location.path('/settings');
        }

        $scope.initializeTab = function () {
            $scope.successMessage = '';
            $scope.alertMessage = '';
        }

        $scope.getTemplates = function() {
            $scope.selectedTemplateId = "";
            $scope.selectedPostcardTemplateId = "";
            $scope.selectedLetterTemplateId = "";
            $scope.template = {
              name: '',
              projectId:  $scope.selectedProject?$scope.selectedProject._id:'',
              subject: '',
              html: '',
              datetime: '',
              sender: $scope.user.emailAddress,
              active: false
            };
            $scope.letterTemplate = {
              metadata: {
                name: '',
                datetime: '',
                type: 'Letter',
                projectId: $scope.selectedProject?$scope.selectedProject._id:'',
                address: {
                  address: $scope.user.address,
                  city: $scope.user.city,
                  state: $scope.user.state,
                  zipcode: $scope.user.zipcode
                }
              },
              description: '',
              html: '',
            }
            $scope.postcardTemplate = {
              metadata: {
                name: '',
                datetime: '',
                type: 'Postcard',
                projectId:  $scope.selectedProject?$scope.selectedProject._id:'',
                address: {
                  address: $scope.user.address,
                  city: $scope.user.city,
                  state: $scope.user.state,
                  zipcode: $scope.user.zipcode
                }
              },
              description: '',
              html: '',
            }
            templateService.getAll().then(response => {
                $scope.templates = response.sort(function(a, b){
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

            let headerOptions = {
              headers: {
                Authorization: 'Basic ' + btoa(lobApiKey+":")
              }
            }
            $http.get('https://api.lob.com/v1/templates?limit=99&metadata[userId]='+$scope.user._id, headerOptions).then((res) => {
                if(res.data.data.length > 0) {
                  $scope.postcardTemplates = _.filter(res.data.data, function(template){ return template.metadata && template.metadata.type=='Postcard'; });
                  $scope.letterTemplates = _.filter(res.data.data, function(template){ return template.metadata && template.metadata.type=='Letter'; });
                } else {
                  $scope.postcardTemplates = [];
                  $scope.letterTemplates = [];
                }
              });
        }

        $scope.selectTemplate = function (type) {
            if($scope.selectedTemplateId || $scope.selectedPostcardTemplateId || $scope.selectedLetterTemplateId) {
                switch(type) {
                  case 'Email':
                    $scope.template = _.filter($scope.templates, function(tmp) { return tmp._id == $scope.selectedTemplateId; })[0];
                    $scope.template.datetime = moment($scope.template.datetime);
                    break;
                  case 'Postcard':
                    $scope.postcardTemplate = _.filter($scope.postcardTemplates, function(tmp) { return tmp.id == $scope.selectedPostcardTemplateId; })[0];
                    $scope.postcardTemplate.html = $scope.postcardTemplate.published_version.html;
                    $scope.postcardFront = $scope.postcardTemplate.metadata.image?$scope.postcardTemplate.metadata.image:"";
                    $scope.postcardTemplate.metadata.datetime = moment($scope.postcardTemplate.metadata.datetime);
                    $scope.postcardTemplate.metadata.address = {
                      address: $scope.postcardTemplate.metadata.address && $scope.postcardTemplate.metadata.address.address?$scope.postcardTemplate.metadata.address.address:$scope.user.address,
                      city: $scope.postcardTemplate.metadata.address && $scope.postcardTemplate.metadata.address.city?$scope.postcardTemplate.metadata.address.city:$scope.user.city,
                      state: $scope.postcardTemplate.metadata.address && $scope.postcardTemplate.metadata.address.state?$scope.postcardTemplate.metadata.address.state:$scope.user.state,
                      zipcode: $scope.postcardTemplate.metadata.address && $scope.postcardTemplate.metadata.address.zipcode?$scope.postcardTemplate.metadata.address.zipcode:$scope.user.zipcode
                    }
                    break;
                  case 'Letter':
                    $scope.letterTemplate = _.filter($scope.letterTemplates, function(tmp) { return tmp.id == $scope.selectedLetterTemplateId; })[0];
                    $scope.letterTemplate.html = $scope.letterTemplate.published_version.html;
                    $scope.letterTemplate.metadata.datetime = moment($scope.letterTemplate.metadata.datetime);
                    $scope.letterLogo = $scope.letterTemplate.metadata.image?$scope.letterTemplate.metadata.image:"";
                    $scope.postcardTemplate.metadata.address = {
                      address: $scope.letterTemplate.metadata.address && $scope.letterTemplate.metadata.address.address ?$scope.letterTemplate.metadata.address.address:$scope.user.address,
                      city: $scope.letterTemplate.metadata.address && $scope.letterTemplate.metadata.address.city?$scope.letterTemplate.metadata.address.city:$scope.user.city,
                      state: $scope.letterTemplate.metadata.address && $scope.letterTemplate.metadata.address.state?$scope.letterTemplate.metadata.address.state:$scope.user.state,
                      zipcode: $scope.letterTemplate.metadata.address && $scope.letterTemplate.metadata.address.zipcode?$scope.letterTemplate.metadata.address.zipcode:$scope.user.zipcode
                    }
                    break;
                }
            } else {
                $scope.template = {
                  name: '',
                  projectId: '',
                  subject: '',
                  html: '',
                  datetime: '',
                  sender: '',
                  active: false
                };
                $scope.letterTemplate = {
                  metadata: {
                    name: '',
                    datetime: '',
                    type: 'Letter',
                    projectId: '',
                    address: {
                      address: $scope.user.address,
                      city: $scope.user.city,
                      state: $scope.user.state,
                      zipcode: $scope.user.zipcode
                    }
                  },
                  description: '',
                  html: '',
                }
                $scope.postcardTemplate = {
                  metadata: {
                    name: '',
                    datetime: '',
                    type: 'Postcard',
                    projectId: '',
                    address: {
                      address: $scope.user.address,
                      city: $scope.user.city,
                      state: $scope.user.state,
                      zipcode: $scope.user.zipcode
                    }
                  },
                  description: '',
                  html: '',
                }
                $scope.postcardFront = "";
                $scope.letterLogo = $scope.user.logo;
            }
        }

        $scope.saveTemplate = function (type) {
            $scope.successMessage = '';
            $scope.alertMessage = '';
            if(type == 'Email') {
              $scope.template.datetime = new Date($scope.template.datetime);
              if($scope.template.name && $scope.template.html) {
                if($scope.template._id) {
                    templateService.update($scope.template).then(response => {
                        $scope.successMessage = "Template has been updated."
                        $scope.getTemplates();
                    }).catch (err => {
                        console.error(err);
                    });
                } else {
                    templateService.save($scope.template).then(response => {
                        $scope.successMessage = "Template has been saved."
                        $scope.getTemplates();
                    }).catch (err => {
                        console.error(err);
                    });
                }
              } else {
                $scope.alertMessage = "Template name and content is required.";
              }
            } else {
              let template = type=='Postcard'?$scope.postcardTemplate:$scope.letterTemplate;
              if(template.metadata.name && template.html) {
                  template.metadata.userId = $scope.user._id;
                  template.metadata.datetime = new Date(template.metadata.datetime);
                  template.metadata.image = type=='Postcard'?$scope.postcardFront:$scope.letterLogo;
                  if(template.metadata.image) {
                      $http.post('/api/users/upload/image',
                        {
                          image: template.metadata.image
                        }, {
                          headers: {
                            Authorization: authorizedService.returnAuthHeader()
                          }
                        }).then((res) => {
                          template.metadata.image = res.data.url;
                          $scope.uploadTemplate(template);
                        });
                  } else {
                    $scope.uploadTemplate(template);
                  }
              } else {
                $scope.alertMessage = "Template name and content is required.";
              }
            }
        }

        $scope.uploadTemplate = function(template) {
          let headerOptions = {
            headers: {
              Authorization: 'Basic ' + btoa(lobApiKey+":")
            }
          }
          if(template.id) {
            $http.post('https://api.lob.com/v1/templates/'+template.id, template, headerOptions).then((res) => {
                $scope.successMessage = "Template has been saved successfully."
                $scope.getTemplates();
              });
          } else {
            $http.post('https://api.lob.com/v1/templates', template, headerOptions).then((res) => {
                $scope.successMessage = "Template has been saved successfully."
                $scope.getTemplates();
              });
          }
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
        }

        $scope.calculatePrice = function(records) {
          let plans = _.filter($scope.blasterSources, function(source) { return source.title.indexOf($scope.calculatedRates.type)>=0; })
          let startPrice = plans[0].price * records.length;
          $scope.calculatedRates.totalCount =  records.length;
          $scope.calculatedRates.price =  startPrice;
          $scope.calculatedRates.unitPrice = plans[0].price;
          $scope.calculatedRates.tax =  (startPrice - $scope.calculatedRates.discount - $scope.calculatedRates.sugarcash) / 100 * parseFloat($scope.taxrate[0].percentage);
          $scope.calculatedRates.total =  parseFloat(startPrice) + $scope.calculatedRates.tax - $scope.calculatedRates.sugarcash - $scope.calculatedRates.discount;
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

        $scope.processBlaster = function(template, records) {
          if(template.metadata) {
            let url = template.metadata.type=='Postcard'?'https://api.lob.com/v1/postcards':'https://api.lob.com/v1/letters';
            let headerOptions = {
              headers: {
                Authorization: 'Basic ' + btoa(lobApiKey+":")
              }
            }
          
            for(var i = 0; i < records.length; i++) {
              let data = {
                description: template.description,
                to: {
                  name: records[i].name?records[i].name:records[i].company,
                  address_line1: records[i].address1,
                  address_line2: records[i].address2,
                  address_city: records[i].city,
                  address_state: records[i].state,
                  address_zip: records[i].zipcode
                },
                from: template.metadata.address.id,
                //send_date: moment(template.metadata.datetime).toISOString() // it's necessary to upgrade the account
              }
              if(template.metadata.type=='Postcard') {
                data.front = template.metadata.image;
                data.back = template.html;
              } else {
                data.file = template.html;
                data.color = true;
              }
              $http.post(url, data, headerOptions).then((res) => {
                console.log(res);
              });
            }
          } else {
            let recipients = [];
            for(var i = 0; i < records.length; i++)
              recipients.push(records[i].email);
            templateService.send(template, recipients).then(response => {
                $scope.successMessage = "Emails has been sent successfully."
                $scope.getTemplates();
            }).catch (err => {
                console.error(err);
            });
          }
        }

        $scope.openPayment =  function(template, records) {
          let modalInstance = $uibModal.open({
              animation: $scope.animationsEnabled,
              ariaLabelledBy: 'modal-title',
              ariaDescribedBy: 'modal-body',
              templateUrl: '/blaster/checkoutModal.html',
              controller: function ($uibModalInstance) {
                  $scope.paymentProcessed = false;
                  $scope.closePayment = function () {
                      $uibModalInstance.dismiss();
                  }
                  $scope.focusSugarCash = function () {
                      $("#sugarcash").val("$"+$scope.calculatedRates.sugarcash.toFixed(2));
                  }
                  $scope.blurSugarCash = function () {
                      let sugarcash = parseFloat($("#sugarcash").val().substr(1));
                      if(isNaN(sugarcash)) {
                        $scope.couponErrorMessage = "Please type correct number.";
                      } else {
                        if(sugarcash > 0 && (sugarcash > $scope.maxSugarCash || sugarcash > records.length * $scope.calculatedRates.price - 1)) {
                          $scope.couponErrorMessage = "The value should be less than current balance of SugarCash and Price.";
                        } else if(sugarcash > 0) {
                          $scope.calculatedRates.sugarcash = sugarcash;
                        } else
                          return;
                      }
                      $scope.focusSugarCash();
                      $scope.calculatePrice(records);
                  }
                  $scope.updateCoupon = function() {
                    if(!$("#couponCode").val()) {
                      $scope.calculatedRates.discount = 0;
                      $scope.couponErrorMessage = "";
                      return;
                    }
                    $scope.couponCode = $("#couponCode").val();
                    let coupons = _.filter($scope.coupons, function(coupon) { return coupon.name == $scope.couponCode && coupon.valid; });
                    if(coupons.length > 0) {
                      if(coupons[0].duration == "once") {
                        let temp = _.filter($scope.user.coupons, function(coupon) { return coupon.id == coupons[0].id })
                        if(temp.length > 0) {
                          $scope.calculatedRates.discount = 0;
                          $scope.couponErrorMessage = "You have already used this coupon before.";
                          $scope.calculatePrice(records);
                        } else {
                          $scope.calculateCoupon(coupons[0]);
                          $scope.calculatePrice(records);
                        }
                      } else {
                        $scope.calculateCoupon(coupons[0]);
                        $scope.calculatePrice(records);
                      }
                    } else {
                      $scope.calculatedRates.discount = 0;
                      $scope.couponErrorMessage = "Your coupon code is invalid.";
                      $scope.calculatePrice(records);
                    }
                  }
                  $scope.processPayment = function () {
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
                              $uibModalInstance.close({status: true, data: records});
                          }
                        });
                  }
                  this.stripeCallback = function (status, response) {
                      if (response.error) {
                          // there was an error. Fix it.
                          $scope.couponErrorMessage = "Your card information is invalid.";
                      } else {
                          $scope.couponErrorMessage = "";
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
                                  $uibModalInstance.close({status: true, data: records});
                              }
                            });
                      }
                  };
              },
              controllerAs: 'scope',
              scope: $scope
          });

          modalInstance.result.then(res => {
              if(res.status) {
                if(!$scope.calculatedRates.discount > 0 && ($scope.getSugarCash($scope.calculatedRates.total) > 0 || $scope.calculatedRates.sugarcash > 0)) {
                  let type = template.metadata?template.metadata.type:"Email";
                  if($scope.calculatedRates.sugarcash > 0)
                    $scope.credits.push({amount: $scope.calculatedRates.sugarcash * (-1), description: "Blaster - " + type + " - " + records.length})
                  if($scope.getSugarCash($scope.calculatedRates.total) > 0)
                    $scope.credits.push({amount: $scope.getSugarCash($scope.calculatedRates.total), description: "Blaster - " + type + " - " + records.length})
                  loginService.updateCredit($scope.credits).then(response => {
                    $scope.processBlaster(template, records);
                  });
                } else {
                  $scope.processBlaster(template, records);
                }
              }
          });
        }

        $scope.sendEmailBlaster = function(template, records) {
          if(!template.subject) {
            $scope.alertMessage = 'Subject field is required.';
            return;
          }
          $scope.calculatePrice(records);
          $scope.openPayment(template, records);
        }

        $scope.sendLobBlaster = function(template, records) {
          if(!template.metadata.address.address) {

            $scope.alertMessage = 'Address field is required';
            return;
          }
          let headerOptions = {
            headers: {
              Authorization: 'Basic ' + btoa(lobApiKey+":")
            }
          }

          records = _.filter(records, function(record) { return record.address1 && record.city && record.state && record.zipcode; })
          if(records.length == 0) {
            console.log(records, 'address info')
        
            $scope.alertMessage = 'No valid address in selected project';
            return;
          }
          let type = template.metadata.type;
          template.metadata.image = type=='Postcard'?$scope.postcardFront:$scope.letterLogo;
          if(type=='Postcard' && !template.metadata.image) {
            $scope.alertMessage = 'Front side image of postcard is required.';
            return;
          }

          if(type=='Letter' && !template.metadata.image) {
            $scope.alertMessage = 'Letter logo is required.';
            return;
          }
          $http.post('https://api.lob.com/v1/addresses',
            {
              name: $scope.user.fullName,
              company: $scope.user.company,
              email: $scope.user.emailAddress,
              phone: $scope.user.phoneNumber,
              address_line1: template.metadata.address.address,
              address_city: template.metadata.address.city,
              address_state: template.metadata.address.state,
              address_zip: template.metadata.address.zipcode
            }, headerOptions).then((res) => {
                //  let addressId = res.data.id;
                template.metadata.address.id = res.data.id;
                $scope.calculatePrice(records);
                $scope.openPayment(template, records);
            }).catch (err=> {
                $scope.alertMessage = err.data.error.message;
            });
        }

        $scope.sendTemplate = function (type) {
            $scope.successMessage = '';
            $scope.alertMessage = '';
            let template = $scope.template;
            if(type!='Email')
              template = type=='Postcard'?$scope.postcardTemplate:$scope.letterTemplate;

            if(!template.html) {
              $scope.alertMessage = 'HTML content is required';
              return;
            }

            if(!template.projectId && !(template.metadata && template.metadata.projectId)) {
              $scope.alertMessage = 'You must select one project';
              return;
            }

            let projectId = template.projectId?template.projectId:template.metadata.projectId;

            projectListService.getAllForProject(projectId).then(response=>{
                $totalEntries = [];
                angular.forEach(response, function(item) {
                    $totalEntries = $totalEntries.concat(item.entries);
                });

                let emails = _.filter($totalEntries, function(record) { return record.email !='' && record.email !=null; });
                if(type=='Email' && emails.length==0) {
                  $scope.alertMessage = 'No email address in choosed project';
                  return;
                }

                $scope.calculatedRates.type = type;
                if(type=='Email')
                  $scope.sendEmailBlaster(template, emails);
                else
                  $scope.sendLobBlaster(template, $totalEntries);

            }).catch (err=> {
                console.error(err);
            })

            // $scope.template.datetime = new Date($scope.template.datetime);
            // $scope.template.active = true;
            // if($scope.template._id) {
            //   templateService.update($scope.template).then(response => {
            //       $scope.successMessage = "Email will be sent in time successfully."
            //       $scope.getTemplates();
            //   }).catch (err => {
            //       console.error(err);
            //   });
            // } else {
            //   templateService.save($scope.template).then(response => {
            //       $scope.successMessage = "Email will be sent in time successfully."
            //       $scope.getTemplates();
            //   }).catch (err => {
            //       console.error(err);
            //   });
            // }
        }

        $scope.previewTemplate = function (type) {
          
            let htmlContent = type=='Postcard'?$scope.postcardTemplate.html:$scope.letterTemplate.html;
            let headerOptions = {
              headers: {
                Authorization: 'Basic ' + btoa(lobApiKey+":")
              }
            }
            let size = {
              Postcard: [4, 6],
              Letter: [11, 8.5]
            }
            if(htmlContent) {
              if(type == 'Letter' && $scope.letterLogo) {
                htmlContent = '<img src="'+$scope.letterLogo+'" height="25px">'+htmlContent;
              }

              let template = $scope.template;
              if(type!='Email')
                template = type=='Postcard'?$scope.postcardTemplate:$scope.letterTemplate;

              if(!template.projectId && !(template.metadata && template.metadata.projectId)) {
                $scope.alertMessage = 'You must select one project';
                return;
              }
  
              let projectId = template.projectId?template.projectId:template.metadata.projectId;

              // array with preview templates
              let localStorageTemplateKey = type + '_' + projectId;
              let previewTemplates = JSON.parse(localStorage.getItem(localStorageTemplateKey));
              if (previewTemplates == null)
              {
                previewTemplates = [];
              }
              for(var i = previewTemplates.length - 1; i >= 0 ; i--) {
                if(previewTemplates[i].draft == true) {
                  $http.delete('https://api.lob.com/v1/templates/'+ previewTemplates[i].templateId, headerOptions).then((res) => {
                    console.log(res);
                  });
                  previewTemplates.splice(i, 1);
                }
              }
              $http.post('https://api.lob.com/v1/templates', { html: htmlContent}, headerOptions).then((res) => {
                previewTemplates.push({
                  templateId: res.data.id,
                  draft: true
                });
                localStorage.setItem(localStorageTemplateKey, JSON.stringify(previewTemplates));
                //setTimeout(() => {
                $http.post('https://api.lob.com/v1/templates/'+res.data.id +'/preview',
                {
                    "height": size[type][0],
                    "width": size[type][1],
                    "save_data": false,
                    "data": {
                      "product": type
                    }
                }, headerOptions).then((res) => {
                  if(type=='Postcard') {
                    window.open($scope.postcardFront, '_blank');
                  }
                  let previewUrl = res.data.url;
                  $http.get(previewUrl, headerOptions).then((res) => {
                    let previewWindow = window.open(previewUrl, '_blank');
                  }).catch((err) => {
                   setTimeout(() => {
                    let previewWindow = window.open(previewUrl, '_blank');  
                   }, 5000)
                  });
                });// }, 5000)
              });
            } else {
              $scope.alertMessage = 'HTML content is required';
            }
            console.log(type, 'stuff')
        }
        $scope.cancelLogo = function() {
            $scope.letterLogo = "";
            $('.file-upload-input').replaceWith($('.file-upload-input').clone());
            $('.file-upload-content').hide();
            $('.image-upload-wrap').show();
            $scope.cropper.destroy();
           
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
                  $scope.letterLogo = res.data.url;
                  $('.file-upload-content').show();
                  $('.cropButtonWrapper').show();
                  $('.image-upload-wrap').hide();

                  var letterImage = document.getElementById("letterImage");
                  setTimeout(function() {
                    $scope.cropper = new Cropper(letterImage, {});
                  }, 50)
                });
              $scope.$apply();
            };

            reader.readAsDataURL(e.target.files[0]);
            console.log('stuff here', e.target.file)
        }

        $scope.cropLogo = function() {
          $http.post('/api/users/upload/image',
            {
              image: $scope.cropper.getCroppedCanvas().toDataURL('image/png')
            }, {
              headers: {
                Authorization: authorizedService.returnAuthHeader()
              }
            }).then((res) => {
              $scope.letterLogo = res.data.url;
              $('.file-upload-content').show();
              $('.image-upload-wrap').hide();
              $('.cropButtonWrapper').hide();
              $scope.cropper.destroy();
      
            });
        }

        $scope.cancelFrontImage = function() {
            $scope.postcardFront = "";
            $('.file-upload-content').hide();
            $('.image-upload-wrap').show();
            $('.file-upload-input').val('');
            $scope.cropper.destroy();
            console.log('postcardFront',postcardFront)
            
        }

        $scope.previewFront = function(e) {
            var reader = new FileReader();
            reader.onload = function (e) {
              var img = new Image();
              img.src = e.target.result;
              
              img.onload = function() {
               
                var imgWidth = this.width;
                var imgHeight = this.height;
                console.log('image height2', imgHeight)
                console.log('image width2', imgWidth)
                console.log('image width2', e)
                if(this.width < 1275 || this.height < 1875) {
                  $scope.alertMessage = "The choosed image should be correct size!";
                  $scope.$apply();
                  return;
                }
                $http.post('/api/users/upload/image',
                  {
                    image: e.target.result
                  }, {
                    headers: {
                      Authorization: authorizedService.returnAuthHeader()
                    }
                  }).then((res) => {
                    $scope.postcardFront = res.data.url;
                    if($scope.alertMessage == "The choosed image should be correct size!")
                      $scope.alertMessage = "";
                    $('.file-upload-content').show();
                    $('.image-upload-wrap').hide();
                  });
              }
              $scope.$apply();
            };
            console.log(e.target.files[0], 'tisisssdjsdjksdkjsd')
            reader.readAsDataURL(e.target.files[0]);
        }

        $scope.toggleToolbar = function() {
          if ($('.btn-toolbar').css('display') == 'none') {
              $(".btn-toolbar").show();
              $(".toggleToolbar").css("top","50px");
              $(".ta-scroll-window.form-control").css("margin-top", "0px");
          } else {
              $(".btn-toolbar").hide();
              $(".toggleToolbar").css("top","0px");
              $(".ta-scroll-window.form-control").css("margin-top", "30px");
          }
        }
  }]);
