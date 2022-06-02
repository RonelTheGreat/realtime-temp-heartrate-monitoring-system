#include <SoftwareSerial.h>

#include <ESP8266WiFi.h>
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>

#include <SocketIoClient.h>

#include <OneWire.h>
#include <DallasTemperature.h>

#include <U8x8lib.h>

// RX, TX
SoftwareSerial softSerial(D7, D8);

SocketIoClient socket;

#define ONE_WIRE_BUS 12
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature tempSensors(&oneWire);

U8X8_SH1106_128X64_NONAME_HW_I2C u8x8(/* reset=*/ U8X8_PIN_NONE);

const char *accessPointName = "HBT DEVICE";

boolean isSerialDataReady = false;
char serialData[16];

float temperature = 0.0;
char temperatureInString[8];
int pulseRate = 0;

void setup() {
  Serial.begin(9600);
  softSerial.begin(9600);

  initOled();
  connectToWifi();
  initTempSensor();

  // server address, port and URL
  socket.begin("wearable-hbt.herokuapp.com");
  socket.emit("deviceConnect");
}

void loop() {
  socket.loop();
  receiveSerialData();
  parseSerialData();
}

void connectToWifi() {
  WiFi.mode(WIFI_STA);
  WiFiManager wifiManager;

  wifiManager.setAPCallback(reconfigureWifi);

  if (!wifiManager.autoConnect(accessPointName)) {
    ESP.restart();
    delay(1000);
  }

  u8x8.clearDisplay();
  u8x8.setCursor(2, 0);
  u8x8.print("Successfully");
  u8x8.setCursor(3, 2);
  u8x8.print("connected!");

  delay(3000);
  u8x8.clearDisplay();
}
void initOled() {
  u8x8.begin();
  u8x8.setPowerSave(0);
  u8x8.setFont(u8x8_font_7x14_1x2_f);
}
void initTempSensor() {
  tempSensors.begin();
}

void showHeartRate(char *heartRate) {
  // holds final string to display
  char finalString[16];

  // construct final string to display
  sprintf(finalString, "BPM  : %s  ", heartRate);

  // display to oled
  u8x8.drawString(1, 0, finalString);
}
void showTemperature(float temperature) {
  // holds final string to display
  char finalString[16];

  // conversion of float to string
  dtostrf(temperature, 4, 2, temperatureInString);

  // construct final string to display
  sprintf(finalString, "Temp : %s C", temperatureInString);

  // display to oled
  u8x8.drawString(1, 3, finalString);
}
void showBatteryLevel(char *batteryLevel) {
  // holds final string to display
  char finalString[16];

  // construct final string to display
  sprintf(finalString, "Batt : %s%%  ", batteryLevel);

  // display to oled
  u8x8.drawString(1, 6, finalString);
}

float getCurrentTemperature() {
  tempSensors.requestTemperatures();
  return tempSensors.getTempCByIndex(0);
}
void reconfigureWifi(WiFiManager *wifiManager) {
  u8x8.clearDisplay();
  u8x8.setCursor(5, 0);
  u8x8.print("Failed");
  u8x8.setCursor(7, 2);
  u8x8.print("to");
  u8x8.setCursor(4, 4);
  u8x8.print("connect!");

  delay(3000);
  u8x8.clearDisplay();
  u8x8.setCursor(0, 0);
  u8x8.print("Configure WiFi");
  u8x8.setCursor(0, 4);
  u8x8.print("AP:");
  u8x8.setCursor(4, 4);
  u8x8.print(accessPointName);
  u8x8.setCursor(0, 6);
  u8x8.print("IP:");
  u8x8.setCursor(4, 6);
  u8x8.print(WiFi.softAPIP());
}
void receiveSerialData() {
  static boolean recvInProgress = false;
  static byte index = 0;
  char startMarker = '<';
  char endMarker = '>';
  char receivedCharacter;

  while (softSerial.available() > 0 && isSerialDataReady == false) {
    receivedCharacter = softSerial.read();

    if (recvInProgress == true) {

      if (receivedCharacter != endMarker) {
        serialData[index] = receivedCharacter;
        index++;
      } else {
        serialData[index] = NULL;
        index = 0;
        recvInProgress = false;
        isSerialDataReady = true;
      }

    } else if (receivedCharacter == startMarker) {
      recvInProgress = true;
    }
  }
}
void parseSerialData() {
  if (!isSerialDataReady) {
    return;
  }

  // parse serial data
  const char delimiter[2] = ":";
  char *heartRate;
  char *batteryLevel;
  char *emergencyState;

  heartRate = strtok(serialData, delimiter);
  if (heartRate != NULL) {
    batteryLevel = strtok(NULL, delimiter);
    if (batteryLevel != NULL) {
      emergencyState = strtok(NULL, delimiter);
    }
  }

  // display data
  showHeartRate(heartRate);
  showTemperature(getCurrentTemperature());
  showBatteryLevel(batteryLevel);

  // construct data & send to server via websocket
  char data[64];
  sprintf(data, "{\"data\": \"%s:%s:%s:%s\"}", emergencyState, heartRate, temperatureInString, batteryLevel);

  socket.emit("dataFromDevice", data);

  isSerialDataReady = false;
}
