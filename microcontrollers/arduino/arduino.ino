#include <SoftwareSerial.h>
#include "MAX30100_PulseOximeter.h"
#include <Battery.h>

PulseOximeter pulseSensor;

Battery battery(3000, 4200, A0);

// RX, TX
SoftwareSerial softSerial(7, 8);

// sending serial data timer
unsigned long timeElapsed = 0;
unsigned long lastUpdate = 0;
const unsigned int updateInterval = 1000;

// battery level
unsigned long lastCalcTime = 0;
const unsigned int calcInterval = 10;
bool startAveraging = true;
const byte numReadings = 10;
int readings[numReadings];
int readIndex = 0;
int total = 0;
int averageBatteryLevel = 0;

// emergency state
char emergencyState[2] = "n";

// for buttons
const int commonPin = 2;
const int buttonPins[] = { 10, 12 };
unsigned long lastButtonPress = 0;
bool hasPressedButton = false;

void setup() {
  Serial.begin(9600);
  softSerial.begin(9600);

  battery.begin(5000, 1.0, &sigmoidal);
  resetBatteryReadings();

  initButtons();

  initPulseSensor();
}

void loop() {
  timeElapsed = millis();

  pushButtonEventListener();
  
  pulseSensor.update();
  calcBatteryLevelAverage();
  
  sendData(false);
}

void initPulseSensor() {
  Serial.println(F("Initializing pulse sensor..."));

  if (!pulseSensor.begin()) {
    Serial.println(F("Failed to start pulse sensor"));
    while (1);
  }

  //set pulse sensor current
  pulseSensor.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
  Serial.println(F("Sucess!"));
}
void initButtons() {
  configureCommon();
  attachInterrupt(digitalPinToInterrupt(commonPin), pressInterrupt, FALLING);
}

void sendData(bool isForced) {
  if (timeElapsed - lastUpdate >= updateInterval || isForced) {
    lastUpdate = timeElapsed;
    
    // construct serial data
    char data[16];
    sprintf(data, "<%i:%i:%s>", (int)pulseSensor.getHeartRate(), averageBatteryLevel, emergencyState);

    Serial.println(data);
    // send to serial
    softSerial.write(data);

    // start calculating battery level average
    if (!startAveraging) {
      startAveraging = true;
    }

    // reset emergency state
    strcpy(emergencyState, "n");
  }
}

void pressInterrupt() {
  // debounce
  if (timeElapsed - lastButtonPress < 200) {
    return;
  }

  lastButtonPress = timeElapsed;
  hasPressedButton = true;
}
void pushButtonEventListener() {
  if (!hasPressedButton) {
    return;
  }
  
  // Setup pins
  configureDistinct();
  for (int i = 0; i < sizeof(buttonPins) / sizeof(int); i++) {
    if (!digitalRead(buttonPins[i])) {
      handleButtonPress(i);
    }
  }

  // return to original state
  hasPressedButton = false;
  configureCommon();
}
void handleButtonPress(int button) {
  // emergency
  if (button + 1 == 1) {
    strcpy(emergencyState, "e");
  } else if (button + 1 == 2) {
    // stop emergency
    strcpy(emergencyState, "s");
  }

  // force send data
  sendData(true);
}

void calcBatteryLevelAverage() {
  if (timeElapsed - lastCalcTime >= calcInterval && startAveraging) {
    lastCalcTime = timeElapsed;
    
    total = total - readings[readIndex];
    readings[readIndex] = battery.level();
    total = total + readings[readIndex];

    readIndex = readIndex + 1;

    if (readIndex >= numReadings) {
      startAveraging = false;
      readIndex = 0;
    }

    averageBatteryLevel = total / numReadings;
  }
}
void resetBatteryReadings() {
  for (byte i = 0; i < numReadings; i++) {
    readings[i] = 0;
  }
}
void configureCommon() {
  pinMode(commonPin, INPUT_PULLUP);

  for (int i = 0; i < sizeof(buttonPins) / sizeof(int); i++) {
    pinMode(buttonPins[i], OUTPUT);
    digitalWrite(buttonPins[i], LOW);
  }
}
void configureDistinct() {
  pinMode(commonPin, OUTPUT);
  digitalWrite(commonPin, LOW);

  for (int i = 0; i < sizeof(buttonPins) / sizeof(int); i++) {
    pinMode(buttonPins[i], INPUT_PULLUP);
  }
}
