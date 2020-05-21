const validator = require("validator");

const { ServerError } = require("../errors");

const axios = require("axios");

const validateFields = (fields) => {
  for (let fieldName in fields) {
    let fieldValue = fields[fieldName].value;
    const fieldType = fields[fieldName].type;

    if (!fieldValue) {
      throw new ServerError(`Field ${fieldName} is undefined!`, 400);
    }

    switch (fieldType) {
      case "ascii":
        fieldValue += "";
        if (!validator.isAscii(fieldValue)) {
          throw new ServerError(`Field ${fieldName} must contain only ascii characters!`, 400);
        }
        break;
      case "alpha":
        fieldValue += "";
        if (!validator.isAlpha(fieldValue)) {
          throw new ServerError(`Field ${fieldName} must contain only letters!`, 400);
        }
        break;
      case "int":
        fieldValue += "";
        if (!validator.isInt(fieldValue)) {
          throw new ServerError(`Field ${fieldName} must be an integer!`, 400);
        }
        break;
      case "jwt":
        fieldValue += "";
        if (!validator.isJWT(fieldValue)) {
          throw new ServerError(`Field ${fieldName} must be a JWT!`, 400);
        }
        break;
      case "date":
        fieldValue += "";
        if (!validator.toDate(fieldValue)) {
          throw new ServerError(`Field ${fieldName} must be a date!`, 400);
        }
        break;
      case "email":
        fieldValue += "";
        if (!validator.isEmail(fieldValue)) {
          throw new ServerError(`Field ${fieldName} must be an email!`, 400);
        }
        break;
    }
  }
};

const createUser = async (token) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/users?token=${token}`;

  axios.post(`http://${host}:${port}${path}`);
};

const validateUser = async (token, id) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/users/validate?token=${token}&id=${id}`;

  const response = await axios.post(`http://${host}:${port}${path}`);

  return response.data == "True";
};

const getSeasonId = (monthId) => {
  switch (monthId) {
    case 2:
    case 3:
    case 4:
      return 1;
    case 5:
    case 6:
    case 7:
      return 2;
    case 8:
    case 9:
    case 10:
      return 3;
    default:
      return 4;
  }
};

module.exports = {
  validateFields,
  createUser,
  validateUser,
  getSeasonId,
};
