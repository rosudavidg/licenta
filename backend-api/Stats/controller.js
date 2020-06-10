const express = require("express");
const router = express.Router();
const StatsService = require("./services.js");
const { accountIsReady } = require("../middlewares/index.js");
const { authorizeAndExtractToken } = require("../security/JWT/index.js");

const { ServerError } = require("../errors");
const { validateFields, createUser, validateUser, prefetchUser } = require("../utils");
const { generateToken } = require("../security/JWT/index.js");

router.get("/availability", authorizeAndExtractToken, accountIsReady, async (req, res, next) => {
  const { userId } = req.state.decoded;

  try {
    res.status(200).json(await StatsService.availableStats(userId));
  } catch (err) {
    next(err);
  }
});

router.get("/", authorizeAndExtractToken, accountIsReady, async (req, res, next) => {
  const { userId } = req.state.decoded;

  try {
    res.status(200).json(await StatsService.getStats(userId));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
