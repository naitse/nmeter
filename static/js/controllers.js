'use strict';

/* Controllers */

angular.module('nmeter.controllers', []).
  controller('LatencyCtrl', ['$scope', 'webapi', 'charttheme', '$q', function($scope, webapi, charttheme, $q) {

  		$scope.runEnabled = true;
  		$scope.nochange = true;
  		$scope.testConfig = {};
  		$scope.hpscount = 0;
  		$scope.hpserrorcount = 0;

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

  		$scope.saveConfig = function(){

  			$.each($scope.testConfig,function(el){
  				console.log(el)
  				if($scope.testConfig[el] == null){$scope.testConfig[el] = ''}
  			})
  			webapi.setConfig($scope.testConfig, function(resp){
  				$scope.nochange = true;
  			})
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
		// requestHPSSuccess()

		function requestRTData() {

			webapi.getResponseTime(function(data){
				$scope.rtData = data
				rtchart.series[0].setData($scope.rtData, true);
				setTimeout(requestRTData(), 10000);
			},function(data){
				$scope.rtData = data
				rtchart.series[0].setData($scope.rtData, true);
				setTimeout(requestRTData(), 10000);
			});
		    
		}

		function requestHPSData() {

			webapi.getHPS(function(data){
				$scope.hpsData = data.data
				$scope.hpscount = data.total;
				hpschart.series[0].setData($scope.hpsData, true);
				setTimeout(requestHPSData(), 10000);
			},function(data){
				$scope.hpsData = data.data
				$scope.hpscount = data.total;
				hpschart.series[0].setData($scope.hpsData, true);
				setTimeout(requestHPSData(), 10000);
			});
		    
		}

		function requestHPSSuccess() {

			webapi.getSuccessTotal(function(data){
				if(data.success != null){
					$scope.hpserrorcount = $scope.hpscount - data.success;
				}
				setTimeout(requestHPSSuccess(), 10000);
			},function(data){
				if(data.success != null){
					$scope.hpserrorcount = $scope.hpscount - data.success;
				}
				setTimeout(requestHPSSuccess(), 10000);
			});
		    
		}

		$scope.userMessage = function(){

			var out = 'Loading...'

			if($scope.hpscount > 0 && $scope.hpserrorcount == 0){
				out = 'Looking good so far!'
			}

			if($scope.hpserrorcount > 0 && $scope.hpscount > $scope.hpserrorcount){
				out = 'Mmm, there are some errors'
			}

			if($scope.hpserrorcount > 0 && $scope.hpscount == $scope.hpserrorcount){
				out = 'OMG!!!! STAAAPP'
			}

			return out;
			
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