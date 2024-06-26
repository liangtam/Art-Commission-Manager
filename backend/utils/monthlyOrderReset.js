const User = require("../models/userModel");

const resetMonthlyUserData = async () => {
  try {
    await User.updateMany(
      {},
      {
        $set: {
          monthlyNumOfCommissions: 0,
          monthlyIncome: 0,
        },
      }
    );
  } catch (error) {
    console.error("Error resetting monthly data: ", error);
  }
};

module.exports = { resetMonthlyUserData };
