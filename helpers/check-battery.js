const checkBattery = (battery) => {
  // if detected low battery
  if (battery < refBattery) {
    badBatterySamples++;
  } else if (battery > refBattery) {
    goodBatterySamples++;
  }

  // if good battery
  if (battery > refBattery && badBatterySamples > 0) {
    badBatterySamples = 0;
  } else if (battery < refBattery && goodBatterySamples > 0) {
    goodBatterySamples = 0;
  }

  // if received consecutive bad battery
  if (badBatterySamples >= badBatterySampleThreshold) {
    goodBatterySamples = 0;
    return true;
  }
  // good battery
  if (goodBatterySamples >= goodBatterySampleThreshold) {
    badBatterySamples = 0;
    return false;
  }
};

module.exports = checkBattery;
