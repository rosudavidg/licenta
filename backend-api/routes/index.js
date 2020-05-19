const Router = require("express")();

const UsersController = require("../Users/controller.js");

Router.use("/users", UsersController);

module.exports = Router;
