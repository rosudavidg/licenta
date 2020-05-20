const express = require("express");
const router = express.Router();
const QuestionsService = require("./services.js");
const { authorizeAndExtractToken } = require("../security/JWT/index.js");

// TODO: campul ready trebuie sa fie setat; adauga middleware
router.get("/", authorizeAndExtractToken, async (req, res, next) => {
  const { userId } = req.state.decoded;

  try {
    // Daca nu exista nicio intrebare activa, se va genera una
    if (!(await QuestionsService.activeQuestionExists(userId))) {
      await QuestionsService.create(userId);
    }

    // Se extrage intrebarea activa
    question = await QuestionsService.getActiveQuestion(userId);

    // Se intoarce intrebarea
    res.status(200).json(question);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
