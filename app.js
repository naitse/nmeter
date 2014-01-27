
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

app.get('/api/hps', function (req, res) {
    var output = [];

    command = "cd /home/ubuntu/apache-jmeter-2.10/lib/ext/ && java -jar CMDRunner.jar --tool Reporter --generate-csv /home/ubuntu/hps.csv --input-jtl /home/ubuntu/results.jtl --plugin-type HitsPerSecond"
    exec(command, {maxBuffer: 5024*1024}, function(error, stdout, stderr){
      if (error !== null) {
          console.log('exec error: ' + error);
          res.end();
      }


      //CSV File Path or CSV String or Readable Stream Object
        var csvFileName="/home/ubuntu/hps.csv";

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

});

app.get('/api/responseTime', function (req, res) {
    var output = [];

    command = "cd /home/ubuntu/apache-jmeter-2.10/lib/ext/ && java -jar CMDRunner.jar --tool Reporter --generate-csv /home/ubuntu/rt.csv --input-jtl /home/ubuntu/results.jtl --plugin-type ResponseTimesOverTime"
    exec(command, {maxBuffer: 5024*1024}, function(error, stdout, stderr){
      if (error !== null) {
          console.log('exec error: ' + error);
          res.json(false);
      }


      //CSV File Path or CSV String or Readable Stream Object
        var csvFileName="/home/ubuntu/rt.csv";

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

});

app.get('/api/read', function (req, res){

    var parser = new xml2js.Parser();

    fs.readFile('/home/ubuntu/stress.jmx', function(err, data) {
     parser.parseString(data, function (err, parsedObject) {
            var rOut = {
                domain: parsedObject.jmeterTestPlan.hashTree[0].hashTree[0].hashTree[0].HTTPSamplerProxy[0].stringProp[0]._,
                nthreads:parseInt(parsedObject.jmeterTestPlan.hashTree[0].hashTree[0].ThreadGroup[0].stringProp[1]._),
                ramptime:parseInt(parsedObject.jmeterTestPlan.hashTree[0].hashTree[0].ThreadGroup[0].stringProp[2]._),
                duration:parseInt(parsedObject.jmeterTestPlan.hashTree[0].hashTree[0].ThreadGroup[0].stringProp[3]._),
                delay:parseInt(parsedObject.jmeterTestPlan.hashTree[0].hashTree[0].ThreadGroup[0].stringProp[4]._)
            }
            res.json(rOut);
            //res.json(parsedObject)
         // _.each(parsedObject, function(sample){
             // sample = sample.$
             // output.push([parseInt(sample.ts), parseInt(sample.t)])

         // })

          //res.json(output);
     });
    });

});

app.get('/api/run', function (req, res) {
    var output = [];

    command = "sudo /home/ubuntu/apache-jmeter-2.10/bin/./jmeter -n -t /home/ubuntu/stress.jmx -l /home/ubuntu/results.jtl"
    exec(command, {maxBuffer: 5024*1024}, function(error, stdout, stderr){
      if (error !== null) {
          console.log('exec error: ' + error);
          res.end({error: error});
      }

      res.json({state:'running'})

    });

});

console.log('Express running at 9999')
app.listen(80)
