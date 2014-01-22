'use strict';


// Declare app level module which depends on filters, and services
var nMeter = angular.module('nmeter', [
  'ngRoute',
  'nmeter.filters',
  'nmeter.directives',
  'nmeter.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/latency', {templateUrl: 'partials/latency.html', controller: 'LatencyCtrl'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/latency'});
}]);
