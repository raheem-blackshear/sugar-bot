'use strict';

angular.module('sweetLeads').factory('dataService',['$q', ($q) => {
    let service = {};
    service.reqModel = {};

    service.updateModel = function(model) {
        service.reqModel = model;
    };

    service.getModel = function() {
        return service.reqModel;
    };

    return service;
}]);