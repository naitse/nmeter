'use strict';


// Declare app level module which depends on filters, and services
var nMeter = angular.module('nmeter', [
  'ngRoute',
  'nmeter.filters',
  'nmeter.directives',
  'nmeter.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/latency.html', controller: 'LatencyCtrl'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);
