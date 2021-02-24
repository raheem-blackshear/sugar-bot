'use strict';

angular.module('sweetLeads').factory('templateService',
    ['$http', '$window', '$cookies', 'authorizedService', ($http, $window, $cookies, authorizedService) => {
        let templateService = {};

        templateService.getAll = () => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/template'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        templateService.save = (templateModel) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                data: templateModel,
                method: "POST",
                url: '/api/template'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        templateService.update = (templateModel) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                data: templateModel,
                method: "POST",
                url: '/api/template/update/'+templateModel._id})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        templateService.send = (template, recipients) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                data: { template, recipients },
                method: "POST",
                url: '/api/template/send' })
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        return templateService;
    }]);
