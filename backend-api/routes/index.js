const Router = require("express")();

const UsersController = require("../Users/controller.js");
const QuestionsController = require("../Questions/controller.js");
const StatsController = require("../Stats/controller.js");
const StatusController = require("../Status/controller.js");

Router.use("/users", UsersController);
Router.use("/questions", QuestionsController);
Router.use("/stats", StatsController);
Router.use("/status", StatusController);

module.exports = Router;
