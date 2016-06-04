var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var https = require('https');
var fs = require('fs');

var options = {
        key: fs.readFileSync('/etc/letsencrypt/live/' + process.env.HOSTNAME + '/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/' + process.env.HOSTNAME + '/cert.pem')
};

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({extended: true}));  // JSONの送信を許可
app.use(bodyParser.json());                        // JSONのパースを楽に（受信時）
// app.get('/', function(request, response) {
//     response.send('Hello World!');
// });

app.post('/callback', function(req, res){

    //ヘッダーを定義
    console.log('define headers');
    var headers = {
        'Content-Type' : 'application/json; charset=UTF-8',
        'X-Line-ChannelID' : process.env.LINE_CHANNEL_ID,
        'X-Line-ChannelSecret' : process.env.LINE_CHANNEL_SECRET,
        'X-Line-Trusted-User-With-ACL' : process.env.LINE_MID
    };

    // 送信相手の設定（配列）
    console.log('set to user');
    var to_array = [];
    to_array.push(req.body['result'][0]['content']['from']);


    // 送信データ作成
    console.log('make sending data');
    var data = {
        'to': to_array,
        'toChannel': 1383378250, //固定
        'eventType':'138311608800106203', //固定
        "content": {
            "messageNotified": 0,
            "messages": [
                // テキスト
                {
                    "contentType": 1,
                    "text": 'hello world!',
                }
            ]
        }
    };

    //オプションを定義
    console.log('define options');
    var options = {
        url: 'https://trialbot-api.line.me/v1/events',
        headers: headers,
        json: true,
        body: data
    };

    console.log('post data');
    request.post(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
        } else {
            console.log('error: '+ JSON.stringify(response));
        }
    });

});

console.log('start');
https.createServer(options, app).listen(process.env.PORT);
