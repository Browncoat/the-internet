var wifi = require('wifi-cc3000'),
    tessel = require('tessel'),
    portA = tessel.port['A'],
    outputPin = portA.pin['G1'],
    network = 'HOME-A88',
    pass = '93A9D39DFD34F9D7',
    security = 'wpa2',
    timeouts = 0,
    quotes = require('./it_crowd_quotes.json');

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

var http = require( 'http' );
setTimeout( function() {
    http.createServer( function (req, res) {
        responseBlink();
        var quote = quotes[Math.floor(Math.random() * (quotes.length + 1)) + 0];
        res.writeHead( 200, {'Content-Type': 'text/plain'} );
        res.end(quote);
    }).listen( 80 );
}, 10000 );

function connect() {
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

