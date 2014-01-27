
	var path =  require('path'),
    fs = require('fs'),
    _ = require('underscore'),
    express = require('express'),
    Q = require('q'),
    xml2js = require('xml2js');
    var sys = require('sys')
    var exec = require('child_process').exec;
    var Converter=require("csvtojson").core.Converter;
    var xpath = require('xpath')
      , dom = require('xmldom').DOMParser



var app = express();

//app.set('port', process.env.PORT || 9000);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
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

app.get('/api/readDep', function (req, res){

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

app.get('/api/read', function (req, res){

    fs.readFile('/home/ubuntu/stress.jmx', function(err, data) {
    //fs.readFile('/temp/stress.jmx', function(err, data) {

        data = data.toString();

        var doc = new dom().parseFromString(data)
        var domain = xpath.select("//stringProp[@name='HTTPSampler.domain']/text()", doc).toString()
        var nthreads = xpath.select("//stringProp[@name='ThreadGroup.num_threads']/text()", doc).toString()
        var ramptime = xpath.select("//stringProp[@name='ThreadGroup.ramp_time']/text()", doc).toString()
        var duration = xpath.select("//stringProp[@name='ThreadGroup.duration']/text()", doc).toString()
        var delay = xpath.select("//stringProp[@name='ThreadGroup.delay']/text()", doc).toString()
        var method = xpath.select("//stringProp[@name='HTTPSampler.method']/text()", doc).toString()
        var _path = xpath.select("//stringProp[@name='HTTPSampler.path']/text()", doc).toString()
        var contentEncoding = xpath.select("//stringProp[@name='HTTPSampler.contentEncoding']/text()", doc).toString()

        var postBody = Boolean(xpath.select("//boolProp[@name='HTTPSampler.postBodyRaw']/text()", doc).toString())

        var arguments = {type:'',data:[]}

        if(typeof postBody != 'undefined' && postBody == true){
            arguments.type = 'post'
            arguments.data = xpath.select("//elementProp[@name='HTTPsampler.Arguments']/collectionProp/elementProp/stringProp[@name='Argument.value']/text()", doc).toString()
        }else{
            arguments.type = 'query'
            var argum = xpath.select("//elementProp[@name='HTTPsampler.Arguments']/collectionProp/elementProp", doc)
            for (var i = argum.length - 1; i >= 0; i--) {
                var argName = xpath.select("stringProp[@name='Argument.name']/text()", argum[i]).toString()
                var argValue = xpath.select("stringProp[@name='Argument.value']/text()", argum[i]).toString()
                arguments.data.push({key:argName,value:argValue})
            };
        }

        var rOut = {
            domain: domain,
            nthreads:parseInt(nthreads),
            ramptime:parseInt(ramptime),
            duration:parseInt(duration),
            delay:parseInt(delay),
            method:method,
            path:_path,
            contentEncoding:contentEncoding,
            arguments:arguments
        }

        res.json(rOut)
    });

});

app.post('/api/save', function (req, res){

    fs.readFile('/home/ubuntu/stress.jmx', function(err, data) {
    //fs.readFile('/temp/stress.jmx', function(err, data) {

        data = data.toString();

        var doc = new dom().parseFromString(data)
        var domain = xpath.select("//stringProp[@name='HTTPSampler.domain']/text()", doc).toString()
        var nthreads = xpath.select("//stringProp[@name='ThreadGroup.num_threads']/text()", doc).toString()
        var ramptime = xpath.select("//stringProp[@name='ThreadGroup.ramp_time']/text()", doc).toString()
        var duration = xpath.select("//stringProp[@name='ThreadGroup.duration']/text()", doc).toString()
        var delay = xpath.select("//stringProp[@name='ThreadGroup.delay']/text()", doc).toString()
        var method = xpath.select("//stringProp[@name='HTTPSampler.method']/text()", doc).toString()
        var _path = xpath.select("//stringProp[@name='HTTPSampler.path']/text()", doc).toString()
        var contentEncoding = xpath.select("//stringProp[@name='HTTPSampler.contentEncoding']/text()", doc).toString()

        console.log(data.indexOf('<stringProp name="HTTPSampler.domain">'+domain+'</stringProp>'))
        //set domain
        data = data.replace('<stringProp name="HTTPSampler.domain">'+domain+'</stringProp>', '<stringProp name="HTTPSampler.domain">'+req.body.domain+'</stringProp>')
                .replace('<stringProp name="ThreadGroup.num_threads">'+nthreads+'</stringProp>', '<stringProp name="ThreadGroup.num_threads">'+req.body.nthreads+'</stringProp>')
                .replace('<stringProp name="ThreadGroup.ramp_time">'+ramptime+'</stringProp>', '<stringProp name="ThreadGroup.ramp_time">'+req.body.ramptime+'</stringProp>')
                .replace('<stringProp name="ThreadGroup.duration">'+duration+'</stringProp>', '<stringProp name="ThreadGroup.duration">'+req.body.duration+'</stringProp>')
                .replace('<stringProp name="ThreadGroup.delay">'+delay+'</stringProp>', '<stringProp name="ThreadGroup.delay">'+req.body.delay+'</stringProp>')
                .replace('<stringProp name="HTTPSampler.path">'+_path+'</stringProp>', '<stringProp name="HTTPSampler.path">'+req.body.path+'</stringProp>')
                .replace('<stringProp name="HTTPSampler.method">'+method+'</stringProp>', '<stringProp name="HTTPSampler.method">'+req.body.method+'</stringProp>')


        // fs.writeFile('/temp/stress.jmx', '', function (err) {
        //   if (err) throw err;
        //     fs.writeFile('/temp/stress.jmx', data, function (err) {
        //         if (err) throw err;
        //     });
        // });

        fs.writeFile('/home/ubuntu/stress.jmx', '', function (err) {
          if (err) throw err;
            fs.writeFile('/home/ubuntu/stress.jmx', data, function (err) {
                if (err) throw err;
            });
        });

        var doc = new dom().parseFromString(data)
        var domain = xpath.select("//stringProp[@name='HTTPSampler.domain']/text()", doc).toString()
        var nthreads = xpath.select("//stringProp[@name='ThreadGroup.num_threads']/text()", doc).toString()
        var ramptime = xpath.select("//stringProp[@name='ThreadGroup.ramp_time']/text()", doc).toString()
        var duration = xpath.select("//stringProp[@name='ThreadGroup.duration']/text()", doc).toString()
        var delay = xpath.select("//stringProp[@name='ThreadGroup.delay']/text()", doc).toString()
        var method = xpath.select("//stringProp[@name='HTTPSampler.method']/text()", doc).toString()
        var _path = xpath.select("//stringProp[@name='HTTPSampler.path']/text()", doc).toString()
        var contentEncoding = xpath.select("//stringProp[@name='HTTPSampler.contentEncoding']/text()", doc).toString()


        var postBody = Boolean(xpath.select("//boolProp[@name='HTTPSampler.postBodyRaw']/text()", doc).toString())

        var arguments = {type:'',data:[]}

        if(typeof postBody != 'undefined' && postBody == true){
            arguments.type = 'post'
            arguments.data = xpath.select("//elementProp[@name='HTTPsampler.Arguments']/collectionProp/elementProp/stringProp[@name='Argument.value']/text()", doc).toString()
        }else{
            arguments.type = 'query'
            var argum = xpath.select("//elementProp[@name='HTTPsampler.Arguments']/collectionProp/elementProp", doc)
            for (var i = argum.length - 1; i >= 0; i--) {
                var argName = xpath.select("stringProp[@name='Argument.name']/text()", argum[i]).toString()
                var argValue = xpath.select("stringProp[@name='Argument.value']/text()", argum[i]).toString()
                arguments.data.push({key:argName,value:argValue})
            };
        }

        var rOut = {
            domain: domain,
            nthreads:parseInt(nthreads),
            ramptime:parseInt(ramptime),
            duration:parseInt(duration),
            delay:parseInt(delay),
            method:method,
            path:_path,
            contentEncoding:contentEncoding,
            arguments:arguments
        }

        res.json(rOut)
    });

});

app.get('/api/run', function (req, res) {
    var output = [];

    command = "sudo cat /dev/null > /home/ubuntu/results.jtl && sudo /home/ubuntu/apache-jmeter-2.10/bin/./jmeter.sh -n -t /home/ubuntu/stress.jmx -l /home/ubuntu/results.jtl"
    exec(command, {maxBuffer: 5024*1024}, function(error, stdout, stderr){
      if (error !== null) {
          console.log('exec error: ' + error);
          res.end({error: error});
      }

      res.json({state:'running'})

    });

});

app.get('/api/terminate', function (req, res) {
    var output = [];

    command = "sudo pkill -KILL java | grep jmeter"
    exec(command, {maxBuffer: 5024*1024}, function(error, stdout, stderr){
      if (error !== null) {
          console.log('exec error: ' + error);
          res.end({error: error});
      }

      res.json({state:'stop'})

    });

});

console.log('Express running at 9999')
app.listen(80)
