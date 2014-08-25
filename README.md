Serial API
==========
This is a serial API that can be used to communicate with embbeded devices over a serial port.
A good example is communicating with an Arduino that is connected through USB.

Protocol
--------
* Client will send "YO" to the embedded device until it responds with "HI", at that point we know there is a valid connection between the two.
* Protection against bufferoverflow. Client can max send 256 characters as one command. After that the device will responsd to everything with "@" because it's in a lock mode. To unlock/reset again the client needs to send "!".
* "#" marks the end of a command

!! Use simple message arduino library

SERVER: Y
CLIENT: d 20<CR> 					// Read value of I2C address 20
SERVER: 1111111111111101*OK 		// Server returns values of I2C device
CLIENT: SET*20%0000000000000010# 	// turn light in position 1 on


 r a -> read analog pins
 r d -> read digital pins
 w d [pin] [value] -> write digital pin
 w a [pin] [value] -> write analog pin

 R 20 -> read I2C values on address 20
 W 20 (0000000000000010)toInt -> read I2C values on address 20
