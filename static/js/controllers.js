'use strict';

/* Controllers */

angular.module('nmeter.controllers', []).
  controller('LatencyCtrl', ['$scope', 'webapi', 'charttheme', function($scope, webapi, charttheme) {

		var chart
  		var highchartsOptions = Highcharts.setOptions(charttheme);
  		var colors = Highcharts.getOptions().colors;

		$scope.$on('$viewContentLoaded', function() {
			chart = new Highcharts.Chart({
		        chart: {
		            renderTo: 'latency',
		            defaultSeriesType: 'spline',
		            events: {
		                load: requestData
		            }
		        },
		        title: {
		            text: 'Live random data'
		        },
		        xAxis: {
		            type: 'datetime',
		            tickPixelInterval: 150,
		            maxZoom: 20 * 1000
		        },
		        yAxis: {
		            minPadding: 0.2,
		            maxPadding: 0.2,
		            title: {
		                text: 'Value',
		                margin: 80
		            }
		        },
		        series: [{
		            name: 'HPS',
		            data: []
		        }]
		    });     


			requestData()
		})

		function requestData() {
			webapi.getHPS(function(data){

				chart.series[0].setData(data, true);
				setTimeout(requestData, 5000);

			});
		}

		

	//});


  }])
  .controller('MyCtrl2', [function() {

  }]);



  	//$scope.$on('$viewContentLoaded', function() {
		/*webapi.getLatency(function(data){
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
		});*/