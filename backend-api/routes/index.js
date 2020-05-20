const Router = require("express")();

const UsersController = require("../Users/controller.js");
const QuestionsController = require("../Questions/controller.js");

Router.use("/users", UsersController);
Router.use("/questions", QuestionsController);

module.exports = Router;
