var fs = require('fs'),
	child_process = require('child_process'),
    express = require('express'),
    bodyParser = require('body-parser'),
    logger = require('morgan'),
    crypto = require('crypto'),
    ursa = require('ursa');

var APP_CONF = require('./app.conf.js');
console.log(APP_CONF);
var PRIVATE_KEY_PATH = APP_CONF.PRIVATE_KEY_PATH;

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
var publicKeyString = privateKey.toPublicPem().toString();

var app = express();

app.set('port', 8998);

app.use(logger('dev'));
app.use(bodyParser());

app.post('/', function(req, res) {
	console.log('REQUEST RECIEVED: [host]'+req.body.host+'; [FILE]'+req.body.file+'; [PASSWORD]'+req.body.password);
	var error='' , data={};
	if (!req.body.host || !req.body.file || !req.body.password) {
		error = 'param missing';
		console.log('REQUEST ABERTED: param missing');
	}
	else {
		var decryptedPassword;
		try {
			decryptedPassword = privateKey.decrypt(req.body.password, 'base64', 'utf8', ursa.RSA_PKCS1_PADDING);
		}
		catch (e) {
			console.log('Password decrypt error:');
			console.log(e);
		}
		if (decryptedPassword === undefined || decryptedPassword.indexOf(req.body.host) !== 0) {
			error = 'password invalid';
			console.log('REQUEST ABERTED: password invalid');
		}
		else {
			var password = decryptedPassword.split(req.body.host)[1];
			var hash = crypto.createHash('md5').update(req.body.host+req.body.file+Date.now()).digest('hex').slice(0, 6);
			console.log('TAIL HASH: '+hash);
			data = {
				hash: hash
			};
			args = [
				'sshtail.sh',
				'-h', req.body.host,
				'-p', password,
				'-f', req.body.file,
				'-s', APP_CONF.WEBTAIL_SERVICE+hash
			];
			child_process.execFile('sh', args, function(error, stdout, stderr){
				console.log(stdout);
			});
		}
	}
	res.json({
		error: error,
		data: data
	});
	res.end();
});
app.get('/public-key', function(req, res) {
    res.end(publicKeyString);
});

app.listen(app.get('port'));
console.log('Listening port ' + app.get('port'));