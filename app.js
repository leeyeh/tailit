var express = require("express"),
    bodyParser = require("body-parser"),
    md5 = require("crypto").createHash('md5');

var app = express();

app.use(bodyParser());

app.post('/', function(req, res) {
	console.log("REQUEST RECIEVED: [host]"+req.body.host+"; [FILE]"+req.body.file);
	var error="" , data={};
	if (!req.body.host || !req.body.file || !req.body.password) {
		error = "param missing.";
		console.log("REQUEST ABERTED: param missing");
	}
	else {
		var hash = md5.update(req.body.host+req.body.file+Date.now()).digest('hex').slice(0, 6);
		console.log("TAIL HASH: "+hash);
		data = {
			hash: hash
		};
	}
	res.json({
		error: error,
		data: data	
	});
	res.end();
});

app.listen(8998);
