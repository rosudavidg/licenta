const Router = require("express")();

const UsersController = require("../Users/controller.js");
const QuestionsController = require("../Questions/controller.js");
const StatsController = require("../Stats/controller.js");

Router.use("/users", UsersController);
Router.use("/questions", QuestionsController);
Router.use("/stats", StatsController);

module.exports = Router;
