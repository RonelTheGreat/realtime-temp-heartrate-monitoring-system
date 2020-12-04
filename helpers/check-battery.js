const checkBattery = (battery) => {
  if (battery <= refBattery) {
    return true;
  }
};

module.exports = checkBattery;
