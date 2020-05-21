const query = require("../database");
const { ServerError } = require("../errors/index.js");

const accountIsReady = async (req, res, next) => {
  try {
    const { userId } = req.state.decoded;

    const response = await query("SELECT * FROM USERS WHERE id = $1 AND ready = TRUE", [userId]);

    if (response.length == 0) {
      throw new ServerError("Data has not been processed.", 400);
    }

    next();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  accountIsReady,
};
