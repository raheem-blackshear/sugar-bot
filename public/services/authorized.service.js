'use strict';

angular.module('sweetLeads').factory('authorizedService',['$q', ($q) => {

    return {
        authenticate: () => {
            let isAuthenticated = sessionStorage.getItem('userInfo');
            if(isAuthenticated){
                return true;
            }
            console.log("not authenticated");
            return $q.reject('not authenticated');
        },
        destroySession: () => {
            return sessionStorage.removeItem('userInfo');
        },
        returnSessionObjByKey: (key) => {
            return sessionStorage.getItem(key);
        },
        returnAuthHeader: () => {
            let userInfo =  sessionStorage.getItem('userInfo');
            userInfo = JSON.parse(userInfo);
            return userInfo.authHeader;
        },
        getUserInfo: () => {
            let userInfo =  sessionStorage.getItem('userInfo');
            userInfo = JSON.parse(userInfo);
            return userInfo;
        }

    };
}]);