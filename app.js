
	var path =  require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    express = require('express'),
    Q = require('q'),
    xml2js = require('xml2js');




var app = express();

//app.set('port', process.env.PORT || 9000);
app.use(express.favicon());
app.use(express.logger('dev'));
//app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(__dirname + '/static'));

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

app.get('/api/responseTime', function (req, res) {
	var output = [];

	var parser = new xml2js.Parser();

	fs.readFile(__dirname + '/responsetime.xml', function(err, data) {
    	parser.parseString(data, function (err, parsedObject) {

    		_.each(parsedObject.testResults.httpSample, function(sample){
    			sample = sample.$
    			output.push([parseInt(sample.ts), parseInt(sample.t)])

    		})

       	 res.json(output);
    	});
	});

});

app.get('/api/hps', function (req, res) {
	var output = [];

	var parser = new xml2js.Parser();

	fs.readFile(__dirname + '/hps.xml', function(err, data) {
    	parser.parseString(data, function (err, parsedObject) {

    		_.each(parsedObject.testResults.httpSample, function(sample){
    			sample = sample.$
    			output.push([parseInt(sample.ts), parseInt(sample.t)])

    		})

       	 res.json(output);
    	});
	});

});

console.log('Express running at 9999')
app.listen(8888)
