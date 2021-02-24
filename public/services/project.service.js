'use strict';

angular.module('sweetLeads').factory('projectService',
    ['$http', '$window', '$cookies', 'authorizedService', ($http, $window, $cookies, authorizedService) => {
        let projectService = {};

        projectService.getAll = () => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/project'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        projectService.getAllProjects = () => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/project/all'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        projectService.save = (projectModel) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                data: projectModel,
                method: "POST",
                url: '/api/project'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        projectService.update = (projectModel) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                data: projectModel,
                method: "POST",
                url: '/api/project/'+projectModel._id})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        return projectService;
    }]);
