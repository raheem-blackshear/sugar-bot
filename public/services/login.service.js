'use strict';

angular.module('sweetLeads').factory('loginService',
    ['$http', '$window', '$cookies', 'authorizedService', ($http, $window, $cookies, authorizedService) => {
        let loginService = {};
        loginService.login = (username, password) => {
            let hash = btoa(username+":"+password);
            let headerRight = "Basic "+hash;
            let userInfo;
            
            return $http({
                headers: { Authorization: headerRight},
                method: "POST",
                url: '/login'})
                .then(function (response) {
                    if (response.status === 200) {
                        userInfo = {
                            authHeader: response.config.headers['Authorization'],
                            status: response.data.status,
                            email: username,
                            id : response.data.id,
                            role: response.data.role?response.data.role:'user',
                            fullName: response.data.fullName,
                            credit: response.data.credit
                        };
                        $window.sessionStorage['userInfo'] = JSON.stringify(userInfo);
                        if(response.data.role=='admin')
                          return "logged in as admin";
                        else
                          return "logged in";
                    }
                    return "fail";
                }).catch(err => {
                    if(err.status === 400) {
                        return err.data.message;
                    }
                });
        };

        loginService.register = (registerModel) => {
            return $http.post("/api/register",registerModel).then(res => {
              // $window.location.href = "/login";
              return {
                  status: "success",
                  message: "Please check verify your account by clicking the link in the email you signed up with."
              }
            }).catch(err => {
              console.error(err);
              if (err.data.model.code === 11000){
                return {
                  status: "error",
                  message: "Dang! Email address already in use.",
                }
              }
              return {
                status: "error",
                message: "Unable to register"
              };
            });
        };

        loginService.updateProfile = (profileModel) => {
          return $http.post("/api/users/update", profileModel,
            { headers: { Authorization: authorizedService.returnAuthHeader() }}).then(res => {
                const userInfo = JSON.parse($window.sessionStorage['userInfo']);
                userInfo.fullName = profileModel.fullName;
                $window.sessionStorage['userInfo'] = JSON.stringify(userInfo);
                return res.data;
          })
        };

        loginService.updateCoupon = (coupons) => {
          return $http.post("/api/users/updateCoupon", { coupons: coupons},
            { headers: { Authorization: authorizedService.returnAuthHeader() }}).then(res => {
                return res.data;
          })
        }

        loginService.updateCredit = (credits) => {
          return $http.post("/api/users/updateCredit", { credits },
            { headers: { Authorization: authorizedService.returnAuthHeader() }}).then(res => {
                const userInfo = JSON.parse($window.sessionStorage['userInfo']);
                userInfo.credit = credits;
                $window.sessionStorage['userInfo'] = JSON.stringify(userInfo);
                return res.data;
          })
        }

        loginService.updatePurchasedList = (listIds) => {
          return $http.post("/api/users/updatePurchasedList", { listIds },
            { headers: { Authorization: authorizedService.returnAuthHeader() }}).then(res => {
                return res.data;
          })
        }

        loginService.getUser = () => {
          return $http.get("/api/users",
            { headers: { Authorization: authorizedService.returnAuthHeader() }}
        ).then(res => {
            let user = res.data;
            return user;
          })
        };

        loginService.getAllUser = () => {
          return $http.get("/api/users/all",
            { headers: { Authorization: authorizedService.returnAuthHeader() }}
          ).then(res => {
            let user = res.data;
            return user;
          })
        };

        loginService.resetPassword = (emailAddress) => {
            return $http({
                method: "GET",
                url: '/api/users/passwordReset/'+emailAddress,
            }).then(res => {
                return res.data.response;
            }).catch(err => {
                console.error(err);
                return {
                    status: "error",
                    message: "Unable to save"
                };
            })
        };

        loginService.updatePassword = (pass) => {
            return $http({
                        headers: {Authorization: authorizedService.returnAuthHeader()},
                        method: "POST",
                        url: '/api/users/updatePassword',
                        data: {
                          oldpassword: pass.oldPassword,
                          newpassword: pass.password
                        }
            }).then(res => {
                if(res.data.status=="ok" && res.data.password) {
                  const userInfo = JSON.parse($window.sessionStorage['userInfo']);
                  userInfo.authHeader = "Basic " + btoa(userInfo.email + ":" + pass.password);
                  $window.sessionStorage['userInfo'] = JSON.stringify(userInfo);
                }
                return res.data;
            }).catch(err => {
                console.error(err);
                return {
                    status: "error",
                    message: "Unable to save"
                };
            })
        };

        loginService.updatePardot = (email,key, password) => {
            return $http({
                headers: {Authorization: authorizedService.returnAuthHeader()},
                method: "POST",
                url: '/api/users/updatePardot',
                data: {
                    email: email,
                    key: key,
                    password: password
                }
            }).then(res => {
                return res.data;
            }).catch(err => {
                console.error(err);
                return {
                    status: "error",
                    message: "Unable to save"
                };
            })
        };

        loginService.hasPardot = () => {
            return $http({
                headers: {Authorization: authorizedService.returnAuthHeader()},
                method: "GET",
                url: '/api/users/hasPardot'
            }).then(res => {
                return res.data.response.hasPardot;
            }).catch(err => {
                console.error(err);
                return {
                    status: "error",
                    message: "Unable to determine settings."
                };
            })

        };


        loginService.logout = () => {
            authorizedService.destroySession();

            var cookies = $cookies.getAll();
            angular.forEach(cookies, function (v, k) {
                $cookies.remove(k);
            });
            localStorage.removeItem("selectedProject");
            $window.location.href= '/login';
        };

        loginService.addStripeId = (stripeId) => {
            return $http.post("/api/users/addStripeId", {stripeId},
                { headers: { Authorization: authorizedService.returnAuthHeader() }}).then(res => {
                return res.data;
            })
        };

        loginService.active = (userId, active) => {
            return $http.post("/api/users/active", { userId, active },
                { headers: { Authorization: authorizedService.returnAuthHeader() }}).then(res => {
                return res.data;
            })
        };

        loginService.reopen = (userId) => {
            return $http.post("/api/users/reopen", { userId },
                { headers: { Authorization: authorizedService.returnAuthHeader() }}).then(res => {
                return res.data;
            })
        };

        loginService.close = () => {
            return $http.get("/api/users/close",
                { headers: { Authorization: authorizedService.returnAuthHeader() }}).then(res => {
                  authorizedService.destroySession();

                  var cookies = $cookies.getAll();
                  angular.forEach(cookies, function (v, k) {
                      $cookies.remove(k);
                  });
                  localStorage.removeItem("selectedProject");
                  $window.location.href= '/login';
            })
        };

        loginService.updateBillingInformation = (billingModel) => {
            return $http.post("/api/users/updateBillingInformation", billingModel,
                { headers: { Authorization: authorizedService.returnAuthHeader() }}).then(res => {
                return res.data;

            })
        };

        loginService.verifyAccount = (userId) => {
            return $http.get("/api/users/verify/"+userId).then(res => {
                return res.data;
            })
        };

        return loginService;
    }]);
