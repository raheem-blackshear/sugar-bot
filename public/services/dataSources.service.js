'use strict';

angular.module('sweetLeads').factory('dataSourcesService',
    ['$http', '$window', '$cookies', 'authorizedService', ($http, $window, $cookies, authorizedService) => {

        let dataSourcesService = {};
//        let header = authorizedService.returnAuthHeader();

        dataSourcesService.getAll = () => {
          let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/dataSources'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        dataSourcesService.getDataSource = (dsId) => {
          let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/dataSources/getDataSource/' + dsId})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        dataSourcesService.unsubscribe = (dataSourceId) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/payments/remove/'+dataSourceId})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        return dataSourcesService;
    }]);
