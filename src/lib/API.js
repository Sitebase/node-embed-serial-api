var EventEmitter = require('events').EventEmitter,
	serialport = require('serialport'),
	util = require('util'),
	fs = require('fs'),
	SerialPort = serialport.SerialPort;

var default_options = {
	baudrate: 9600,
	dataBits: 8,
	parity: 'none',
	stopBits: 1,
	flowControl: false,
	parser: serialport.parsers.readline("\r")
}

function API( options )
{
	options = options || {};
	this.options = {
		baudrate: 		options.baudrate || default_options.baudrate,
		dataBits: 		options.dataBits || default_options.dataBits,
		parity: 		options.parity || default_options.parity,
		stopBits: 		options.stopBits || default_options.stopBits,
		flowControl: 	options.flowControl || default_options.flowControl,
		parser: 		options.parser || default_options.parser,
	};
	this.connection = null;

	/**
	 * If a method is called that expects a result, like for example readDigital, you can add a callback to the callback
	 * queue and when data is received from the serial device we'll fetch the first callback from the queue and trigger the callback
	 * @type {Array}
	 */
	this.callback_queue = [];
}

// Extend class with an event emitter
util.inherits(API, EventEmitter);

API.prototype.connect = function( path )
{
	var self = this;
	if( isDeviceLive(path) ) {
		var connection = new SerialPort(path, this.options);
		connection.open(function (error) {
			if( error ) {
				self.emit('error', 'Could not make a connection with ' + path);
			} else {
				
				connection.on('data', function(data) {
					result = data.trim();
					
					// If we receive a YO from the embedded device the connection is ok
					// and the prototypes can start reading an writing to the serial connection
					if( result === 'YO' ) {
						self.connection = connection;
						self.emit('ready');
						return;
					}

					// Digital read triggered by interrup
					if( result.substring(0, 3) === "i d" ) {
						var parsed = parse( result );
						self.emit('digital.interrupt', parsed);
						return;
					}

					if( self.callback_queue !== undefined && self.callback_queue.length > 0 ) {
						var callback = self.callback_queue.shift();
						var parsed = parse( result );
						callback( parsed );
						return;
					}

					console.log('Non handled data received:', result);
				}); 

			}
		});
	} else {
		this.emit('error', 'No device available on ' + path);
	}
}

API.prototype.readAnalog = function( callback ) {

	if( ! this.isConnected() )
		return false;

	// Add callback to queue
	this.callback_queue.push( callback );

	var command = 'r a';
	this.send( command );
}

API.prototype.readDigital = function( callback ) {

	if( ! this.isConnected() )
		return false;

	// Add callback to queue
	this.callback_queue.push( callback );

	var command = 'r d';
	this.send( command );
}

API.prototype.writeAnalog = function( pin, value ) {

	if( ! this.isConnected() )
		return false;

	var command = 'w a ' + pin + ' ' + value;
	this.send( command );
}

API.prototype.writeDigital = function( pin, value ) {

	if( ! this.isConnected() )
		return false;

	var command = 'w d ' + pin + ' ' + value;
	this.send( command );
}

/**
 * Send an actual command to the serial device
 * @param  {string} command 
 * @return {void}     
 */
API.prototype.send = function( command ) {

	if( ! this.isConnected() )
		return false;

	console.log('Write command:', command);
	this.connection.write(command + "\r", function(error) {

		if( error )
			console.error( error );

	});
}

/**
 * Check if the current API is connected to a device
 * @return {Boolean} 
 */
API.prototype.isConnected = function() {
	return this.connection === null ? false : true;
}

/**
 * Check if a serial endpoint exists before trying to connect
 * @param {string} path 
 * @return {bool} 
 */
function isDeviceLive( path ) 
{
	return fs.existsSync( path ) ? true : false;
}

/**
 * Parse received line from embedded device
 * @param {string} line 
 * @return {object} 
 */
function parse( line ) {
	var type = line.substring(0, 1);
	
	if( type === "a" ) {
		var raw = line.substring(2).split(' ');
		var result = [];

		// Convert values to ints
		for(idx in raw) {
			var value = raw[idx];
			result.push( parseInt(value) );
		}
		
		return result;
	}

	if( type === "d" ) {
		var raw = line.substring(2).split(' ');
		var result = [];

		// Convert values to ints
		for(idx in raw) {
			var value = raw[idx];
			result.push( parseInt(value) );
		}
		
		return result;
	}

	if( line.substring(0, 3) === "i d" ) {
		var raw = line.substring(4).split(' ');
		var result = [];

		// Convert values to ints
		for(idx in raw) {
			var value = raw[idx];
			result.push( parseInt(value) );
		}
		
		return result;
	}
}

module.exports = API;