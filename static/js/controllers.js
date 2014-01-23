'use strict';

/* Controllers */

angular.module('nmeter.controllers', []).
  controller('LatencyCtrl', ['$scope', 'webapi', 'charttheme', '$q', function($scope, webapi, charttheme, $q) {

  		var highchartsOptions = Highcharts.setOptions(charttheme);
  		var colors = Highcharts.getOptions().colors;

  		var rtchart;
  		var hpschart;

		// hpschart = new Highcharts.Chart({
		//         chart: {
		//             renderTo: 'hps',
		//             events: {
		//                 load: requestData
		//             }
		//         },
		//         title: {
		//             text: ''
		//         },
		//         xAxis: {
		//             type: 'datetime'
		//         },
		//         yAxis: {
		//             minPadding: 0.2,
		//             maxPadding: 0.2,
		//             title: {
		//                 text: 'Value',
		//                 margin: 80
		//             }
		//         },
		//         series: [{
		//             name: 'HPS',
		//             data: []
		//         }]
		//     });     

		// function requestData() {

	 //    	var deferreds = new Array()


  //   		deferreds['hps'] = $q.defer();
		// 	webapi.getHPS(function(data){


		// 		hpschart.series[0].setData(data, true);
		// 		deferreds['hps'].resolve(data);

		// 	});
			
		    
		//     $q.all(deferreds).then(function(val){
		// 		setTimeout(requestData, 5000);
		//     })
		// }

		var hpsData = []

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
		            data: hpsData
		     }]
		}); 

		var rtData = []

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
		            data: rtData
		     }]
		});  

		requestRTData()
		requestHPSData()

		function requestRTData() {

	    	var deferreds = new Array()

    		deferreds['RT'] = $q.defer();
			webapi.getResponseTime(function(data){
				rtchart.series[0].setData(data, true);
				setTimeout(requestRTData(), 5000);
			});
		    
		}

		function requestHPSData() {

	    	var deferreds = new Array()

    		deferreds['RT'] = $q.defer();
			webapi.getHPS(function(data){
				hpschart.series[0].setData(data, true);
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