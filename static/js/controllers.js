'use strict';

/* Controllers */

angular.module('nmeter.controllers', []).
  controller('LatencyCtrl', ['$scope', 'webapi', 'charttheme', function($scope, webapi, charttheme) {

		var chart
  		var highchartsOptions = Highcharts.setOptions(charttheme);
  		var colors = Highcharts.getOptions().colors;

  		var seriesArray = []
		
		function updateChart(){
			console.log(seriesArray)

			chart = $('#latency').highcharts({
				colors: ["#DDDF0D", "#7798BF", "#55BF3B", "#DF5353", "#aaeeee", "#ff0066", "#eeaaee",
			      "#55BF3B", "#DF5353", "#7798BF", "#aaeeee"],
			    chart: {
			    	type: 'spline'
			    },

			    rangeSelector: {
			        selected: 1
			    },

			    title: {
			        text: 'Latency'
			    },

                xAxis: {
	                type: 'datetime',
	                dateTimeLabelFormats: { // don't display the dummy year
	                    month: '%e. %b',
	                    year: '%b'
	                }
	            },
	            yAxis: {
	                title: {
	                    text: 'ms'
	                },
	                min: 0
	            },
			    
			    series: seriesArray
			});
		}

	//$scope.$on('$viewContentLoaded', function() {
		webapi.getLatency(function(data){
			seriesArray.push({
		        name: 'LT',
		        data: data
		    })

		    updateChart()
		});

		webapi.getResponseTime(function(data){
			seriesArray.push({
		        name: 'RT',
		        data: data
		    })

		    updateChart()
		});

		webapi.getHPS(function(data){
			seriesArray.push({
		        name: 'Hps',
		        data: data
		    })

		    updateChart()
		});

	//});


  }])
  .controller('MyCtrl2', [function() {

  }]);