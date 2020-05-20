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
  createByType(userId, question_type);
};

const createByType = async (userId, type) => {
  // Creeaza o intrebare specifica dupa tip

  switch (type) {
    case "today":
      createTodayQuestion(userId);
      break;
    case "season":
      createSeasonQuestion(userId);
      break;
    case "face":
      createFaceQuestion(userId);
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
      "SELECT message, name as type FROM questions q JOIN question_types t ON q.type = t.id WHERE user_id = $1 AND answered = FALSE",
      [userId]
    )
  )[0];

  switch (question["type"]) {
    case "face":
      const faceId = (
        await query("SELECT face_id FROM questions_face f JOIN questions q ON f.id = q.id WHERE q.answered = FALSE")
      )[0]["face_id"];

      question["image"] = await getImage(faceId);
      break;
  }

  return question;
};

module.exports = {
  activeQuestionExists,
  create,
  getActiveQuestion,
};
