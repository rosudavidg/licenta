const query = require("../database");

const axios = require("axios");

const activeQuestionExists = async (userId) => {
  // Intoarce true daca exista cel putin o intrebare activa care nu a primit feedback de la utilizator
  return (
    (await query("SELECT COUNT(*) FROM questions WHERE user_id = $1 AND answered = FALSE", [userId]))[0].count != 0
  );
};

const nonTargetCommonWordsExists = async (userId) => {
  // Intoarce true daca exista cel putin o intrebare de tip common_words care nu si-a atins targetul
  return (
    (
      await query(
        "SELECT COUNT(*) FROM questions_common_words_notify w JOIN questions q ON q.id = w.id WHERE answers != answers_target AND user_id = $1",
        [userId]
      )
    )[0].count != 0
  );
};

const anyFace = async (userId) => {
  // Intoarce true daca exista cel putin o fata detectata in fotografiile utilizatorului
  return (
    (await query("SELECT COUNT(*) FROM faces f JOIN images i ON f.image_id = i.id WHERE user_id = $1", [userId]))[0]
      .count != 0
  );
};

const create = async (userId) => {
  // Tipurile posibile de intrebari
  const question_types = [];

  // Daca nu exista intrebari te tip common_words fara target atins, se pot creea altele
  if (!(await nonTargetCommonWordsExists(userId))) {
    question_types.push("common_words_notify");
  } else {
    question_types.push("common_words");
  }

  // Daca exista cel putin o fata gasita in pozele utilizatorului
  if (await anyFace(userId)) {
    question_types.push("face");
  }

  // TODO: exclude daca in ultima luna s-a completat corect
  // Adauga intrebare de tip season
  question_types.push("season");

  // TODO: exclude daca s-a completat corect astazi
  // Adauga intrebare de tip today
  question_types.push("today");

  // Selecteaza random un tip de intrebare
  question_type = question_types[Math.floor(Math.random() * question_types.length)];

  // Creeaza o noua intrebare
  await createByType(userId, question_type);
};

const createByType = async (userId, type) => {
  // Creeaza o intrebare specifica dupa tip

  switch (type) {
    case "today":
      await createTodayQuestion(userId);
      break;
    case "season":
      await createSeasonQuestion(userId);
      break;
    case "face":
      await createFaceQuestion(userId);
      break;
    case "common_words_notify":
      await createCommonWordsNotify(userId);
      break;
    case "common_words":
      await createCommonWords(userId);
      break;
  }
};

const createTodayQuestion = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'today'"))[0]["id"];
  const answer_type = (await query("SELECT * FROM answer_types WHERE name = 'text'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message, answer_type) VALUES ($1, $2, $3, $4)", [
    type,
    userId,
    "Ce zi a săptămânii este astăzi?",
    answer_type,
  ]);
};

const createSeasonQuestion = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'season'"))[0]["id"];
  const answer_type = (await query("SELECT * FROM answer_types WHERE name = 'text'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message, answer_type) VALUES ($1, $2, $3, $4)", [
    type,
    userId,
    "Ce anotimp este acum?",
    answer_type,
  ]);
};

const createCommonWordsNotify = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'common_words_notify'"))[0]["id"];
  const answer_type = (await query("SELECT * FROM answer_types WHERE name = 'notify'"))[0]["id"];
  const common_words = await query("SELECT * FROM common_words");
  let numberOfElements = 3;
  const selectedElements = [];

  // Selectarea a numberOfElements elemente diferite random
  while (numberOfElements != 0) {
    const element = common_words[Math.floor(Math.random() * common_words.length)]["word"];
    if (!(element in selectedElements)) {
      selectedElements.push(element);
      numberOfElements--;
    }
  }

  const elements = selectedElements.join();

  // Adauga intrebarea generica
  const question = await query(
    "INSERT INTO questions (type, user_id, message, answer_type) VALUES ($1, $2, $3, $4) RETURNING *",
    [type, userId, "Reține următoarea listă de cuvinte!", answer_type]
  );

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_common_words_notify (id, words) VALUES ($1, $2)", [questionId, elements]);
};

const createCommonWords = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'common_words'"))[0]["id"];
  const answer_type = (await query("SELECT * FROM answer_types WHERE name = 'text'"))[0]["id"];

  // Adauga intrebarea generica
  const question = await query(
    "INSERT INTO questions (type, user_id, message, answer_type) VALUES ($1, $2, $3, $4) RETURNING *",
    [type, userId, "Îți mai aduci aminte ultimele cuvinte? Care erau acelea?", answer_type]
  );
};

const createFaceQuestion = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'face'"))[0]["id"];
  const answer_type = (await query("SELECT * FROM answer_types WHERE name = 'text'"))[0]["id"];

  // Extrage toate fetele posibile
  const faces = await query("SELECT f.id FROM faces f JOIN images i ON f.image_id = i.id WHERE user_id = $1", [userId]);

  // Alege o fata random
  const faceId = faces[Math.floor(Math.random() * faces.length)]["id"];

  // Adauga intrebarea generica
  const question = await query(
    "INSERT INTO questions (type, user_id, message, answer_type) VALUES ($1, $2, $3, $4) RETURNING *",
    [type, userId, "Care este prenumele persoanei evidențiate în imagine?", answer_type]
  );

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_face (id, face_id) VALUES ($1, $2)", [questionId, faceId]);
};

const getImage = async (faceId) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/face/${faceId}`;

  // Cerere catre backend-data pentru a afisa imaginea cu bounding box
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getActiveQuestion = async (userId) => {
  const question = (
    await query(
      "SELECT q.id, message, name as type FROM questions q JOIN question_types t ON q.type = t.id WHERE user_id = $1 AND answered = FALSE",
      [userId]
    )
  )[0];

  const questionId = question["id"];

  switch (question["type"]) {
    case "face":
      const faceId = (await query("SELECT face_id FROM questions_face WHERE id = $1", [questionId]))[0]["face_id"];

      question["image"] = await getImage(faceId);
      break;
    case "common_words_notify":
      const words = (await query("SELECT words FROM questions_common_words_notify WHERE id = $1", [questionId]))[0][
        "words"
      ];

      question["words"] = words.split(",");
      break;
  }

  return question;
};

module.exports = {
  activeQuestionExists,
  create,
  getActiveQuestion,
};
