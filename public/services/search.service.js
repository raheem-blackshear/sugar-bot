'use strict';

angular.module('sweetLeads').factory('searchService',
    ['$http', '$window', '$cookies', 'authorizedService', ($http, $window, $cookies, authorizedService) => {

        let service = {};
        service.getSuggestedTags = (terms) => {
          let header = authorizedService.returnAuthHeader();

            return $http({
                headers: { Authorization: header },
                data: { term: terms},
                method: "POST",
                url: '/api/search/similarTerms'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });
        };

        service.getSweetLeads = (searchModel, sources) => {
            let header = authorizedService.returnAuthHeader();

            return $http({
                headers: { Authorization: header },
                data: { search: searchModel, sources },
                method: "POST",
                url: '/api/search'})
                .then(function (response) {
                    if (response.status === 200) {
                        return response.data.response;
                    }
                    return {};
                }).catch(err => {
                    return err;
                });

        };


        return service;
    }]);
