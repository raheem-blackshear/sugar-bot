'use strict';

angular.module('sweetLeads').factory('projectListService',
    ['$http', '$window', '$cookies', 'authorizedService', ($http, $window, $cookies, authorizedService) => {
        let projectListService = {};

        projectListService.getAll = () => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/projectList'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        projectListService.save = (projectListModel) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                data: projectListModel,
                method: "POST",
                url: '/api/projectList'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    console.error(err);
                    if (err.data.response.code === 11000){
                        return {
                            status: "error",
                            message: "Dang! List name already in use.",
                        }
                    }
                    return {
                        status: "error",
                        message: "Unable to save."
                    };
                });
        };

        projectListService.check = (listName) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                data: { listName },
                method: "POST",
                url: '/api/projectList/checkListname'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data;
                    }
                    return {};
                }).catch(err => {
                    console.error(err);
                    if (err.data.response.code === 11000){
                        return {
                            status: "error",
                            message: "Unable to check.",
                        }
                    }
                    return {
                        status: "error",
                        message: "Unable to check."
                    };
                });
        };

        projectListService.merge = (projectListModel,projectListId) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                data: projectListModel,
                method: "POST",
                url: '/api/projectList/mergeInTo/'+ projectListId})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };


        projectListService.getAllForProject = (projectId) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/projectList/' + projectId })
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };


        projectListService.deleteEntry = (projectListId, entryId) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/projectList/deleteEntry/' + projectListId + '/' + entryId })
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        projectListService.updateEntry = (projectListId, entry) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                data: { entry },
                method: "POST",
                url: '/api/projectList/updateEntry/' + projectListId + '/' + entry._id })
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        projectListService.downloadCSV = (projectListId) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                responseType: "blob",
                url: '/api/projectList/downloadCSV/'+projectListId})
                .then(function (response) {
                    if (response.status === 200) {
                        var a = document.createElement('a');
                        var url = window.URL.createObjectURL(response.data);
                        a.href = url;
                        a.download = 'my.csv';
                        document.body.append(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        projectListService.downloadsCSV = (projectListIds) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "Post",
                responseType: "blob",
                url: '/api/projectList/downloadCSV/multiple',
                data: projectListIds })
                .then(function (response) {
                    if (response.status === 200) {
                        var a = document.createElement('a');
                        var url = window.URL.createObjectURL(response.data);
                        a.href = url;
                        a.download = 'my.csv';
                        document.body.append(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        projectListService.pardotSync = (projectListId) => {
            let header = authorizedService.returnAuthHeader();
            return $http({
                headers: { Authorization: header },
                method: "GET",
                url: '/api/integrations/pardot/'+projectListId})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });

        };

        return projectListService;
    }]);
