var api = require('../src/lib/API');

var device = new api({
	baudrate: 115200
});

device.on('error', function( error ) {
	console.log('ERROR:', error)
});


device.on('ready', function( error ) {
	//device.writeDigital(12, 1);
	/*setInterval(function() {
		blink(device, 13, 3, 200);
		device.readDigital(function( result) {
			console.log('Digital receive', result);
		});
	}, 500);*/

	//blink(device, 12, 3);

	device.readAnalog(function( result ) {
		console.log('Analog receive', result);
	});

	device.readDigital(function( result ) {
		console.log('Digital receive', result);
	});

	device.on('digital.interrupt', function( result ) {
		console.log('Digital interrupt received', result);
	});

});
device.connect('/dev/tty.usbmodemfa141');


function blink(device, pin, times, interval) {
	interval = interval || 500;
	times = times || 0;
	var value = 0;
	var counter = 0;
	var interval = setInterval(function() {
		device.writeDigital(pin, value);

		if( counter >= (times*2) && value === 0 ) {
			clearInterval( interval );
			return;
		}

		value = value === 0 ? 1 : 0;
		counter++;
	}, interval);
}