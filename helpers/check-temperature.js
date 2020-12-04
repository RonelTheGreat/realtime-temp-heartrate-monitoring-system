const checkTemperature = (temperature) => {
  // if temperature exceeds reference temperature
  if (temperature > refTemperature) {
    temperatureSamples++;
  }

  // if good temperature but previously detected bad temperature
  // reset samples
  if (temperature <= refTemperature && temperatureSamples > 0) {
    temperatureSamples = 0;
  }

  // if received consecutive bad temperature
  // notify contacts
  if (temperatureSamples >= temperatureSampleThreshold) {
    console.log("reached needed temperature samples");
    return true;
  }
};

module.exports = checkTemperature;
