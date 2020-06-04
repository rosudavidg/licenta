const query = require("../database");
const { ServerError } = require("../errors");
const axios = require("axios");

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

const getProfilepic = async (userId) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/profilepic/${userId}`;

  // Cerere catre backend-data pentru a aduce imaginea de profil
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getFirstName = async (userId) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/firstname/${userId}`;

  // Cerere catre backend-data pentru a aduce prenumele
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const isReady = async (userId) => {
  return (await query("SELECT * FROM users WHERE id = $1 AND ready = TRUE", [userId])).length == 1;
};

module.exports = {
  userExists,
  create,
  getProfilepic,
  isReady,
  getFirstName,
};
