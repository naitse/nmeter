'use strict';

/* Controllers */

angular.module('nmeter.controllers', []).
  controller('LatencyCtrl', ['$scope', 'webapi', 'charttheme', '$q', function($scope, webapi, charttheme, $q) {

  		$scope.runEnabled = true;

  		var highchartsOptions = Highcharts.setOptions(charttheme);
  		var colors = Highcharts.getOptions().colors;

  		var rtchart;
  		var hpschart;

  		$scope.runJob = function(){

  			if($scope.runEnabled == false){
  				return false;
  			}
			$scope.runEnabled = false;
  			webapi.runJob(function(){
  			})
  		}

  		$scope.stopJob = function(){

  			if($scope.runEnabled == true){
  				return false;
  			}

			$scope.runEnabled = true;
  			webapi.stopJob(function(){
  			})
  		}

  		$scope.testConfig = {

  		}


		webapi.getConfig(function(data){

			$.each(data, function(config){
				config = (config == null)?'':config;
			})

			$scope.testConfig  = data;
		})
		

		$scope.hpsData = []

		hpschart = new Highcharts.StockChart({
			chart:{
				renderTo: 'hps',
				animation:false
			},
			rangeSelector : {
				enabled : false,
				inputEnabled: false
			},

			title : {
				text : 'Hits per secons'
			},
			
			series : [{
		            name: 'Hits/s',
		            data: $scope.hpsData
		     }]
		}); 

		$scope.rtData = []

		rtchart = new Highcharts.StockChart({
			chart:{
				renderTo: 'restime',
				animation:false
			},
			rangeSelector : {
				enabled : false,
				inputEnabled: false
			},

			title : {
				text : 'Response Time'
			},
			
			series : [{
		            name: 'ms',
		            data: $scope.rtData
		     }]
		});  

		requestRTData()
		requestHPSData()

		function requestRTData() {

	    	var deferreds = new Array()

    		deferreds['RT'] = $q.defer();
			webapi.getResponseTime(function(data){
				$scope.rtData = data
				rtchart.series[0].setData($scope.rtData, true);
				setTimeout(requestRTData(), 5000);
			});
		    
		}

		function requestHPSData() {

	    	var deferreds = new Array()

    		deferreds['RT'] = $q.defer();
			webapi.getHPS(function(data){
				$scope.hpsData = data
				hpschart.series[0].setData($scope.hpsData, true);
				setTimeout(requestHPSData(), 5000);
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