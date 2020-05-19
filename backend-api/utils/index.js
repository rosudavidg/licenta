const validator = require("validator");

const { ServerError } = require("../errors");

const http = require("http");

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
  const options = {
    host: process.env.BACKEND_DATA_HOST,
    port: process.env.BACKEND_DATA_PORT,
    path: `/users?token=${token}`,
    method: "POST",
  };

  await http
    .request(options, function (res) {
      res.setEncoding("utf8");
      res.on("data", function (chunk) {
        console.log("BODY: " + chunk);
      });
    })
    .end();
};

module.exports = {
  validateFields,
  createUser,
};
