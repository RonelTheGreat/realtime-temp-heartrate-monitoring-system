const checkTemperature = (temperature) => {
  // if temperature exceeds reference temperature
  if (temperature > refTemperature) {
    hasFeverSamples++;
  } else if (temperature < refTemperature) {
    hasNoFeverSamples++;
  }

  // if good temperature but previously detected bad temperature
  // reset samples
  if (temperature <= refTemperature && hasFeverSamples > 0) {
    hasFeverSamples = 0;
  } else if (temperature >= refTemperature && hasNoFeverSamples > 0) {
    hasNoFeverSamples = 0;
  }

  // if received consecutive bad temperature
  // notify contacts
  if (hasFeverSamples >= hasFeverSampleThreshold) {
    hasNoFeverSamples = 0;
    return true;
  }

  if (hasNoFeverSamples >= hasNoFeverSampleThreshold) {
    hasFeverSamples = 0;
    return false;
  }
};

module.exports = checkTemperature;
