// for heart rate
global.heartRateSamples = 0;
global.heartRateSampleThreshold = 10;
global.heartRateThreshold = null;

// for temperature
global.refTemperature = 37.5;
global.hasFeverSamples = 0;
global.hasFeverSampleThreshold = 5;
global.hasNoFeverSamples = 0;
global.hasNoFeverSampleThreshold = 5;
global.hasBeenNotifiedWithFever = false;

// for battery
global.refBattery = 20;
global.badBatterySampleThreshold = 5;
global.badBatterySamples = 0;
global.goodBatterySampleThreshold = 5;
global.goodBatterySamples = 0;
global.hasBeenNotifiedLowBatt = false;

// for device
global.isDeviceConnected = false;
global.hasEmergency = false;
global.isNotifyingContacts = false;
global.isDeviceReady = false;

// for socket
global.connectedContacts = [];
