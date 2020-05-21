const express = require("express");
const router = express.Router();
const QuestionsService = require("./services.js");
const { authorizeAndExtractToken } = require("../security/JWT/index.js");
const { accountIsReady } = require("../middlewares/index.js");
const { ServerError } = require("../errors");

router.get("/", authorizeAndExtractToken, accountIsReady, async (req, res, next) => {
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

router.post("/:id/answer", authorizeAndExtractToken, accountIsReady, async (req, res, next) => {
  const { userId } = req.state.decoded;
  const questionId = req.params.id;

  try {
    // Verifica daca id-ul intrebarii este valid
    if (!(await QuestionsService.canAnswer(userId, questionId))) {
      throw new ServerError("Invalid question id.", 400);
    }

    // Extrage tipul raspunsului
    const answer_type = await QuestionsService.getAnswerType(questionId);

    // Daca raspunsul este de tip confirm
    switch (answer_type) {
      case "confirm":
        await QuestionsService.confirm(questionId);
        break;
      case "choice":
        const { choice } = req.body;

        if (choice == undefined) {
          throw new ServerError("Choice field is missing!", 400);
        }

        await QuestionsService.choose(questionId, choice);

        break;
      case "text":
        const { answer } = req.body;

        if (answer == undefined) {
          throw new ServerError("Answer field is missing!", 400);
        }

        await QuestionsService.answer(questionId, answer);

        break;
    }

    res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
