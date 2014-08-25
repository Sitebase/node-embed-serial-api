#include <SimpleMessageSystem.h> 

int blue = 13;
int green = 12;
int red = 11;

volatile bool interruptReadDigital = false;

void setup()
{
	Serial.begin(115200); // Max supported baud is 115200
	Serial.println("YO");
	attachInterrupt(1, blink, RISING);

	// Status RGB led
	pinMode(blue, OUTPUT);
	pinMode(green, OUTPUT);
	pinMode(red, OUTPUT);
}

void loop()
{
	// We can't do this in the interrupt function self because this seems to lock
	// up the Serial after a few times
	if( interruptReadDigital == true ) {
		messageSendChar('i');
		readdigital();
		interruptReadDigital = false;
		attachInterrupt(1, blink, RISING);
	} else {

		if (messageBuild() > 0) { // Checks to see if the message is complete and erases any previous messages

			// @todo try to use a switch again because it seems to work on readpins
			String action = String(messageGetChar());

			if(action == "r") {
				readpins(); // Call the readpins function
			}

			if(action == "w") {
				writepin(); // Call the writepin function
			}
		}

	}
}

void readpins(){ // Read pins (analog or digital)

	switch (messageGetChar()) { // Gets the next word as a character

		case 'd': // READ digital pins

			readdigital();
			break; // Break from the switch

		case 'a': // READ analog pins

			messageSendChar('a');  // Echo what is being read
			for (char i=0;i<6;i++) {
				messageSendInt(analogRead(i)); // Read pins 0 to 5
			}
			messageEnd(); // Terminate the message being sent

	}

}

void readdigital()
{
	messageSendChar('d');  // Echo what is being read
	for (char i=2;i<11;i++) {
		messageSendInt(digitalRead(i)); // Read pins 2 to 13
	}
	messageEnd(); // Terminate the message being sent	
}

void writepin() { // Write pin

	int pin;
	int state;

	switch (messageGetChar()) { // Gets the next word as a character

		case 'a' : // WRITE an analog pin

			pin = messageGetInt(); // Gets the next word as an integer
			state = messageGetInt(); // Gets the next word as an integer
			pinMode(pin, OUTPUT); //Sets the state of the pin to an output
			analogWrite(pin, state); //Sets the PWM of the pin 
			break;  // Break from the switch


		// WRITE a digital pin
		case 'd' : 

			pin = messageGetInt();  // Gets the next word as an integer
			state = messageGetInt();  // Gets the next word as an integer
			pinMode(pin,OUTPUT);  //Sets the state of the pin to an output
			digitalWrite(pin,state);  //Sets the state of the pin HIGH (1) or LOW (0)

	}

}

void setStatus( int status )
{
	/*digitalWrite(blue, LOW);
	digitalWrite(green, LOW);
	digitalWrite(red, LOW);

	switch( status ) {
		case 1:
			digitalWrite(blue, HIGH);
			break;

	}*/
}

void blink()
{
	detachInterrupt(1);
	//noInterrupts();
	//messageSendChar('i');
	//readdigital();
	interruptReadDigital = true;
	//interrupts();
}