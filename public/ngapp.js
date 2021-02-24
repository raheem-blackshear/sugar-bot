'use strict';
/**
 * Created by barre on 7/16/2017.
 */


let app = angular.module('sweetLeads', [
    'ngCookies',
    'ngRoute',
    'ngTable',
    'ngTagsInput',
    'ngCookies',
    'ngProgress',
    'rzSlider',
    'ngMap',
    'ui.bootstrap',
    'textAngular',
    'moment-picker',
    'sweetLeads.termsOfUse',
    'sweetLeads.policy',
    'sweetLeads.home',
    'sweetLeads.login',
    'sweetLeads.edit',
    'sweetLeads.settings',
    'sweetLeads.blaster',
    'sweetLeads.sugarcash',
    'sweetLeads.help',
    'sweetLeads.list',
    'sweetLeads.confectionery',
    'sweetLeads.projects',
    'sweetLeads.verify',
    'sweetLeads.register',
    'sweetLeads.admin.users',
    'sweetLeads.admin.projects'
]).config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
    $routeProvider.otherwise({redirectTo: '/login'});
    $locationProvider.hashPrefix('!');
    $locationProvider.html5Mode(true);

}])
    .run(function($rootScope, $window) {
    $rootScope.$on('$routeChangeError', function(event, current, previous, rejection) {
        if (rejection === 'not authenticated') {
            $window.location.href = '/login';
        }
    });

}).controller('mainController',['$scope','authorizedService','loginService','dataService', '$window','$rootScope', '$location',
        function($scope, authorizedService, loginService, dataService, $window, $rootScope, $location) {
        $scope.uiState = {
            loggedIn: false
        };
        $rootScope.sugarcash = 0;
        $rootScope.states = {
            "AL": "Alabama",
            "AK": "Alaska",
            "AS": "American Samoa",
            "AZ": "Arizona",
            "AR": "Arkansas",
            "CA": "California",
            "CO": "Colorado",
            "CT": "Connecticut",
            "DE": "Delaware",
            "DC": "District Of Columbia",
            "FM": "Federated States Of Micronesia",
            "FL": "Florida",
            "GA": "Georgia",
            "GU": "Guam",
            "HI": "Hawaii",
            "ID": "Idaho",
            "IL": "Illinois",
            "IN": "Indiana",
            "IA": "Iowa",
            "KS": "Kansas",
            "KY": "Kentucky",
            "LA": "Louisiana",
            "ME": "Maine",
            "MH": "Marshall Islands",
            "MD": "Maryland",
            "MA": "Massachusetts",
            "MI": "Michigan",
            "MN": "Minnesota",
            "MS": "Mississippi",
            "MO": "Missouri",
            "MT": "Montana",
            "NE": "Nebraska",
            "NV": "Nevada",
            "NH": "New Hampshire",
            "NJ": "New Jersey",
            "NM": "New Mexico",
            "NY": "New York",
            "NC": "North Carolina",
            "ND": "North Dakota",
            "MP": "Northern Mariana Islands",
            "OH": "Ohio",
            "OK": "Oklahoma",
            "OR": "Oregon",
            "PW": "Palau",
            "PA": "Pennsylvania",
            "PR": "Puerto Rico",
            "RI": "Rhode Island",
            "SC": "South Carolina",
            "SD": "South Dakota",
            "TN": "Tennessee",
            "TX": "Texas",
            "UT": "Utah",
            "VT": "Vermont",
            "VI": "Virgin Islands",
            "VA": "Virginia",
            "WA": "Washington",
            "WV": "West Virginia",
            "WI": "Wisconsin",
            "WY": "Wyoming"
        }

        $scope.getEmailFromSession = () => {

            let sessionData = authorizedService.returnSessionObjByKey('userInfo');
            if(sessionData != null) {
                $scope.user = JSON.parse(sessionData).email;
                $scope.userName = JSON.parse(sessionData).fullName;
                $scope.role = JSON.parse(sessionData).role;
                $scope.uiState.loggedIn = true;
            }
        };

        $scope.logout = () => {
            loginService.logout();
        };

        $scope.getEmailFromSession();

        $scope.getFullname = () => {
            return JSON.parse($window.sessionStorage['userInfo']).fullName;
        }
        $scope.goToSugarCash = () => {
          $rootScope.activeTab = "SugarCash";
          $location.path('/settings');
        }

        $scope.getCredit = () => {
            let credits = JSON.parse($window.sessionStorage['userInfo']).credit;
            let balance = 0;
            if(credits.length > 0) {
                credits.forEach(function(credit) {
                    balance += credit.amount;
                });
            }
            $rootScope.sugarcash = balance;
            return balance.toFixed(2);
        }

    }]);

app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if (event.which === 13) {
                scope.$apply(function () {
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});
