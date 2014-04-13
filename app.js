var fs = require('fs'),
    express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    crypto = require('crypto'),
    ursa = require('ursa');

var PRIVATE_KEY_PATH = './private-key.pem';

try {
    var privateKey = ursa.createPrivateKey(fs.readFileSync(PRIVATE_KEY_PATH));
    if (!ursa.isKey(privateKey)) {
        throw new Error('Invalid private key');
    }
}
catch (e) {
    console.log(e);
    console.log('Generating RSA key pair');
    var privateKey = ursa.generatePrivateKey(1024);
    fs.writeFile(PRIVATE_KEY_PATH, privateKey.toPrivatePem());
    console.log('New RSA key pair generated: ' + PRIVATE_KEY_PATH);
}

var app = express();

app.set('port', 8998);

app.use(logger('dev'));
app.use(bodyParser());

app.post('/', function(req, res) {
	console.log('REQUEST RECIEVED: [host]'+req.body.host+'; [FILE]'+req.body.file);
	var error='' , data={};
	if (!req.body.host || !req.body.file || !req.body.password) {
		error = 'param missing.';
		console.log('REQUEST ABERTED: param missing');
	}
	else {
		var hash = crypto.createHash('md5').update(req.body.host+req.body.file+Date.now()).digest('hex').slice(0, 6);
		console.log('TAIL HASH: '+hash);
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
app.get('/public-key', function(req, res) {
    res.end(privateKey.toPublicPem().toString());
});

app.listen(app.get('port'));
console.log('Listening port ' + app.get('port'));
