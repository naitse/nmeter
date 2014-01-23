
	var path =  require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    express = require('express'),
    Q = require('q'),
    xml2js = require('xml2js');
    var sys = require('sys')
    var exec = require('child_process').exec;
    var Converter=require("csvtojson").core.Converter;




var app = express();

//app.set('port', process.env.PORT || 9000);
app.use(express.favicon());
app.use(express.logger('dev'));
//app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/static'));


function getSeconds(time)
{
    var today = new Date()
    time = time.replace('.', ':');
    var ts = time.split(':');
    return Date.UTC((today.getUTCFullYear()), (today.getUTCMonth()), (today.getUTCDate()), ts[0], ts[1], ts[2], ts[3]);
}

app.get('/api/latency', function (req, res) {
	var output = [];

	var parser = new xml2js.Parser();

	fs.readFile(__dirname + '/latency.xml', function(err, data) {
    	parser.parseString(data, function (err, parsedObject) {

    		_.each(parsedObject.testResults.httpSample, function(sample){
    			sample = sample.$
    			output.push([parseInt(sample.ts), parseInt(sample.t)])

    		})

       	 res.json(output);
    	});
	});

});

// app.get('/api/responseTime', function (req, res) {
// 	var output = [];

// 	var parser = new xml2js.Parser();

// 	fs.readFile(__dirname + '/responsetime.xml', function(err, data) {
//     	parser.parseString(data, function (err, parsedObject) {

//     		_.each(parsedObject.testResults.httpSample, function(sample){
//     			sample = sample.$
//     			output.push([parseInt(sample.ts), parseInt(sample.t)])

//     		})

//        	 res.json(output);
//     	});
// 	});

// });
app.get('/api/responseTime', function (req, res) {
    var output = [];

    command = "cd /Applications/apache-jmeter-2.10/lib/ext/ && java -jar CMDRunner.jar --tool Reporter --generate-csv /temp/rt.csv --input-jtl /temp/results.jtl --plugin-type ResponseTimesOverTime"
    exec(command, {maxBuffer: 5024*1024}, function(error, stdout, stderr){
      if (error !== null) {
          console.log('exec error: ' + error);
          res.json(false);
      }


      //CSV File Path or CSV String or Readable Stream Object
        var csvFileName="/temp/rt.csv";

        //new converter instance
        var csvConverter=new Converter();

        //end_parsed will be emitted once parsing finished
        csvConverter.on("end_parsed",function(jsonObj){
            _.each(jsonObj.csvRows, function(row){
                output.push([new Date(getSeconds(row['Elapsed time'])).getTime(), parseInt(row['HTTP Request'])])
            })

            res.json(output);

        });

        csvConverter.from(csvFileName);


    });

    // var parser = new xml2js.Parser();

    // fs.readFile(__dirname + '/hps.xml', function(err, data) {
 //     parser.parseString(data, function (err, parsedObject) {

 //         _.each(parsedObject.testResults.httpSample, function(sample){
 //             sample = sample.$
 //             output.push([parseInt(sample.ts), parseInt(sample.t)])

 //         })

 //          res.json(output);
 //     });
    // });

});

app.get('/api/hps', function (req, res) {
	var output = [];

    command = "cd /Applications/apache-jmeter-2.10/lib/ext/ && java -jar CMDRunner.jar --tool Reporter --generate-csv /temp/hps.csv --input-jtl /temp/results.jtl --plugin-type HitsPerSecond"
    exec(command, {maxBuffer: 5024*1024}, function(error, stdout, stderr){
      if (error !== null) {
          console.log('exec error: ' + error);
          res.end();
      }


      //CSV File Path or CSV String or Readable Stream Object
        var csvFileName="/temp/hps.csv";

        //new converter instance
        var csvConverter=new Converter();

        //end_parsed will be emitted once parsing finished
        csvConverter.on("end_parsed",function(jsonObj){

            _.each(jsonObj.csvRows, function(row){
                output.push([new Date(getSeconds(row['Elapsed time'])).getTime(), parseInt(row['Server Hits per Second'])])
            })


            res.json(output);

        });

        csvConverter.from(csvFileName);


    });

	// var parser = new xml2js.Parser();

	// fs.readFile(__dirname + '/hps.xml', function(err, data) {
 //    	parser.parseString(data, function (err, parsedObject) {

 //    		_.each(parsedObject.testResults.httpSample, function(sample){
 //    			sample = sample.$
 //    			output.push([parseInt(sample.ts), parseInt(sample.t)])

 //    		})

 //       	 res.json(output);
 //    	});
	// });

});

console.log('Express running at 9999')
app.listen(8888)
