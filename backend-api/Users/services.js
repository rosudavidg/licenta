const query = require("../database");
const { ServerError } = require("../errors");

const userExists = async (userId) => {
  return (await query("SELECT COUNT(*) FROM users WHERE id = $1", [userId]))[0].count != 0;
};

const create = async (userId) => {
  try {
    await query("INSERT INTO users (id) VALUES ($1)", [userId]);
  } catch (err) {
    if (err.message.includes("users_pkey")) {
      throw new ServerError("User already exists!", 400);
    } else {
      throw err;
    }
  }
};

module.exports = {
  userExists,
  create,
};
