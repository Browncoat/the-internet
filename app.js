var wifi = require('wifi-cc3000'),
    http = require( 'http' ),
    tessel = require('tessel'),
    portA = tessel.port['A'],
    outputPin = portA.pin['G1'],
    portB = tessel.port['B'],
    outputPin2 = portB.pin['G1'],
    network = process.argsv[1],
    pass = process.argsv[2],
    security = 'wpa2',
    timeouts = 0,
    quotes = require('./static/it_crowd_quotes.json');

var html = "<html> <title>The Internet</title> <body> <h1>The Internet</h1> <h3>Generously on loan from The Elders of the Internet</h3> <em>(completely demagnetised By Stephen Hawking himself)</em> <p>It is small. That is one of the surprising things about The Internet.</p> <p>It doesn't have any wires or anything. It's wireless. Much like everything nowadays.</p> <p>It is also very light. Of course, The Internet doesn't weigh anything.</p> <p>It normally goes on top of Big Ben. That's where it gets the best reception.</p> </body> </html>";

var timer;

var restingBlink = function() {
    clearInterval(timer);
    timer = setInterval(function () {
        if  (outputPin.rawRead() == 0) {
            outputPin.output(1);
        } else {
            outputPin.output(0);
        }
    }, 1000);
}

var responseBlink = function() {
    clearInterval(timer);
    var count = 0
    timer = setInterval(function () {
        if  (outputPin.rawRead() == 0) {
            outputPin.output(1);
        } else {
            outputPin.output(0);
        }
        if (count++ == 15) {
            restingBlink();
        }
    }, 200);
}

var responseVibrate = function() {
    outputPin2.output(1);
    var timer = setInterval(function() {
        outputPin2.output(0);
        clearInterval(timer);
    }, 500);
}

setTimeout( function() {
    http.createServer( function (req, res) {
        responseBlink();
        responseVibrate();
        var quote = quotes[Math.floor(Math.random() * (quotes.length + 1)) + 0];
        res.writeHead( 200, {'Content-Type': 'text/plain'} );
        res.end(quote);
    }).listen( 81 );
}, 10000 );

setTimeout( function() {
    http.createServer( function (req, res) {
        responseBlink();
        responseVibrate();
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(html);
        res.end();
    }).listen( 80 );
}, 10000 );

function connect() {
    console.log('connecting');
    wifi.connect({
        security: security,
        ssid: network,
        password: pass,
        timeout: 30
    });
}

wifi.on('connect', function (data) {
    console.log('connect emitted', data);
    restingBlink();
});

wifi.on('disconnect', function(data) {
    console.log('disconnect emitted', data);
    clearInterval(blinkTimer);
});

wifi.on('timeout', function(err) {
    console.log('timeout emitted');
    connect();
});

wifi.on('error', function(err) {
    console.log('error emitted', err);
});

