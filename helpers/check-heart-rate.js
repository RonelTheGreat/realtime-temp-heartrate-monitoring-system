const checkHeartRate = ({ min, max }, heartRate) => {
  // if bad or abnormal heart rate
  if (heartRate < min || heartRate > max) {
    heartRateSamples++;
  }

  // if good or normal heart rate but previously detected bad heart rate
  // reset samples
  if (heartRate >= min && heartRate <= max && heartRateSamples > 0) {
    heartRateSamples = 0;
  }

  // if received consecutive bad heart rate
  // notify contacts
  if (heartRateSamples >= heartRateSampleThreshold) {
    console.log("reached needed heart rate samples");
    return true;
  }
};

module.exports = checkHeartRate;
