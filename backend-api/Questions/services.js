const query = require("../database");

const axios = require("axios");

const { ServerError } = require("../errors");

const { getSeasonId, shuffle, sameWord } = require("../utils");

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
  if (await anyFace(userId)) question_types.push("face");

  // Adauga intrebare de tip season
  if (await canAskSeason(userId)) question_types.push("season");

  // Adauga intrebare de tip today
  if (await canAskToday(userId)) question_types.push("today");

  // Adauga intrebare de tip driving licence
  if (await canAskDrivingLicence(userId)) question_types.push("driving_licence");

  // Adauga intrebare de tip traffic_sign
  if (await canAskTrafficSign(userId)) question_types.push("traffic_sign");

  // Adauga intrebare de tip birthday
  if (await canAskBirthday(userId)) question_types.push("birthday");

  // Adauga intrebari de tip today_date
  if (await canAskTodayDate(userId)) question_types.push("today_date");

  // Adauga intrebari de tip animal
  question_types.push("animal");

  // Adauga intrebari de tip memory game
  question_types.push("memory_game");

  // Adauga intrebari de tip zaruri
  question_types.push("dices");

  // Adauga intrebari de tip ceas
  if (await canAskClock(userId)) question_types.push("clock");

  // Adauga intrebari de tip oras natal
  if (await canAskHometown(userId)) question_types.push("hometown");

  // Adauga intrebari de tip locatie
  if (await canAskLocation(userId)) question_types.push("location");

  // Adauga intrebari de tip limba
  // TODO: verifica daca exista cel putin o limba
  question_types.push("language");

  // Adauga intrebari de tip genuri muzicale
  // TODO: verifica daca exista cel putin un gen muzical
  question_types.push("music_genre");

  // Adauga intrebari de tip carte
  if (await canAskBook(userId)) question_types.push("book");

  // Adauga intrebari de tip film
  if (await canAskMovie(userId)) question_types.push("movie");

  // Adauga intrebari de tip zi sau noapte
  // TODO: verifica daca este in program
  question_types.push("day_or_night");

  // Adauga intrebari de tip semafor
  question_types.push("traffic_light");

  // Adauga intrebari despre tipurile de postari
  // TODO: verifica daca exista cel putin o postare
  question_types.push("post");

  // Adauga intrebari despre directie
  question_types.push("directional");

  // Adauga intrebare despre anul curent
  question_types.push("year");

  // Adauga intrebare tip cuvant invers
  question_types.push("reversed_word");

  // Adauga intrebare de tip rest magazin
  question_types.push("change");

  // Adauga intrebare de tip urmatoarea litera
  question_types.push("next_letter");

  // Adauga intrebare de tip anterioara litera
  question_types.push("prev_letter");

  // Adauga intrebare - are copii
  question_types.push("children");

  // Adauga intrebare - are frati
  question_types.push("brothers");

  // Adauga intrebare - are surori
  question_types.push("sisters");

  // Adauga intrebare - are animale de companie
  question_types.push("pets");

  // Adauga intrebare despre culori
  question_types.push("colors");

  // Adauga intrebare despre scadere
  question_types.push("subtraction_notify");

  // Adauga intrebare despre bani (adunare)
  question_types.push("money");

  // Adauga intrebare despre poligon
  question_types.push("polygon");

  // Adauga intrebare despre jocul labirint
  question_types.push("maze");

  // Selecteaza random un tip de intrebare
  question_type = question_types[Math.floor(Math.random() * question_types.length)];
  // question_type = "clock";

  // Creeaza o noua intrebare
  await createByType(userId, question_type);
};

const canAskToday = async (userId) => {
  const res =
    (
      await query(
        "SELECT a.created_time::date, NOW()::date FROM answers_today a JOIN questions q ON a.id = q.id WHERE q.user_id = $1 AND a.created_time::date = NOW()::date AND a.correct = TRUE",
        [userId]
      )
    ).length > 0;

  return !res;
};

const canAskBook = async (userId) => {
  const res = (await query("SELECT * FROM books WHERE user_id = $1", [userId])).length > 0;

  return res;
};

const canAskMovie = async (userId) => {
  const res = (await query("SELECT * FROM movies WHERE user_id = $1", [userId])).length > 0;

  return res;
};

const canAskClock = async (userId) => {
  const res =
    (
      await query(
        "SELECT a.created_time::date, NOW()::date FROM answers_clock a JOIN questions q ON a.id = q.id WHERE q.user_id = $1 AND a.created_time::date = NOW()::date",
        [userId]
      )
    ).length > 0;

  return !res;
};

const canAskHometown = async (userId) => {
  const res =
    (
      await query(
        "SELECT a.created_time::date, NOW()::date FROM answers_hometown a JOIN questions q ON a.id = q.id WHERE q.user_id = $1 AND a.created_time::date = NOW()::date",
        [userId]
      )
    ).length > 0;

  // TODO: verifica daca exista hometown in date

  return !res;
};

const canAskLocation = async (userId) => {
  const res =
    (
      await query(
        "SELECT a.created_time::date, NOW()::date FROM answers_location a JOIN questions q ON a.id = q.id WHERE q.user_id = $1 AND a.created_time::date = NOW()::date",
        [userId]
      )
    ).length > 0;

  // TODO: verifica daca exista location in date

  return !res;
};

const canAskBirthday = async (userId) => {
  const res =
    (
      await query(
        "SELECT a.created_time::date FROM answers_birthday a JOIN questions q ON a.id = q.id WHERE q.user_id = $1 AND DATE_PART('day', age(NOW()::date, a.created_time::date)) < 7",
        [userId]
      )
    ).length > 0;

  return !res;
};

const canAskSeason = async (userId) => {
  const res =
    (
      await query(
        "SELECT a.created_time::date FROM answers_season a JOIN questions q ON a.id = q.id WHERE q.user_id = $1 AND DATE_PART('month', age(NOW()::date, a.created_time::date)) < 1 AND a.correct = TRUE",
        [userId]
      )
    ).length > 0;

  return !res;
};

const canAskTodayDate = async (userId) => {
  const res =
    (
      await query(
        "SELECT a.created_time::date, NOW()::date FROM answers_today_date a JOIN questions q ON a.id = q.id WHERE q.user_id = $1 AND a.created_time::date = NOW()::date AND a.correct = TRUE",
        [userId]
      )
    ).length > 0;

  return !res;
};

const canAskDrivingLicence = async (userId) => {
  const res = (await query("SELECT * FROM users WHERE id = $1 AND driving_licence IS NULL", [userId])).length > 0;

  return res;
};

const canAskTrafficSign = async (userId) => {
  const res = (await query("SELECT * FROM users WHERE id = $1 AND driving_licence = TRUE", [userId])).length > 0;

  return res;
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
    case "driving_licence":
      await createDrivingLicence(userId);
      break;
    case "traffic_sign":
      await createTrafficSign(userId);
      break;
    case "birthday":
      await createBirthday(userId);
      break;
    case "today_date":
      await createTodayDate(userId);
      break;
    case "memory_game":
      await createMemoryGame(userId);
      break;
    case "animal":
      await createAnimal(userId);
      break;
    case "dices":
      await createDices(userId);
      break;
    case "clock":
      await createClock(userId);
      break;
    case "polygon":
      await createPolygon(userId);
      break;
    case "hometown":
      await createHometown(userId);
      break;
    case "location":
      await createLocation(userId);
      break;
    case "language":
      await createLanguage(userId);
      break;
    case "music_genre":
      await createMusicGenre(userId);
      break;
    case "post":
      await createPost(userId);
      break;
    case "book":
      await createBook(userId);
      break;
    case "movie":
      await createMovie(userId);
      break;
    case "day_or_night":
      await createDayOrNight(userId);
      break;
    case "traffic_light":
      await createTrafficLight(userId);
      break;
    case "directional":
      await createDirectional(userId);
      break;
    case "year":
      await createYear(userId);
      break;
    case "reversed_word":
      await createReversedWord(userId);
      break;
    case "change":
      await createChange(userId);
      break;
    case "next_letter":
      await createNextLetter(userId);
      break;
    case "prev_letter":
      await createPrevLetter(userId);
      break;
    case "children":
      await createChildren(userId);
      break;
    case "brothers":
      await createBrothers(userId);
      break;
    case "sisters":
      await createSisters(userId);
      break;
    case "pets":
      await createPets(userId);
      break;
    case "colors":
      await createColors(userId);
      break;
    case "subtraction_notify":
      await createSubtractionNotify(userId);
      break;
    case "money":
      await createMoney(userId);
      break;
    case "maze":
      await createMaze(userId);
      break;
  }
};

const createTodayQuestion = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'today'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Ce zi a săptămânii este astăzi?",
  ]);
};

const createChange = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'change'"))[0]["id"];

  const totals = [5, 10, 50, 100];

  const total = totals[Math.floor(Math.random() * totals.length)];
  const value = Math.floor(1 + Math.random() * (total - 1));

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Faci cumpărături de ${value} RON. Plătești cu o bancnotă de ${total} RON. Cât primești rest?`,
  ]);

  const questionId = question[0]["id"];

  // Adaug intrebarea specifica
  await query("INSERT INTO questions_change (id, total, value) VALUES ($1, $2, $3)", [questionId, total, value]);
};

const createMoney = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'money'"))[0]["id"];

  const initial = Math.floor(20 + Math.random() * 100);
  const increase = Math.floor(20 + Math.random() * 100);

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Ai ${initial} de lei. Primești ${increase}. Cât ai acum?`,
  ]);

  const questionId = question[0]["id"];

  // Adaug intrebarea specifica
  await query("INSERT INTO questions_money (id, initial, increase) VALUES ($1, $2, $3)", [
    questionId,
    initial,
    increase,
  ]);
};

const createNextLetter = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'next_letter'"))[0]["id"];

  const valueStart = "C".charCodeAt(0);
  const valueStop = "Y".charCodeAt(0);

  const letter = String.fromCharCode(Math.floor(valueStart + Math.random() * (valueStop - valueStart + 1)));

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Ce literă urmează după ${letter}?`,
  ]);

  const questionId = question[0]["id"];

  // Adaug intrebarea specifica
  await query("INSERT INTO questions_next_letter (id, letter) VALUES ($1, $2)", [questionId, letter]);
};

const createPrevLetter = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'prev_letter'"))[0]["id"];

  const valueStart = "C".charCodeAt(0);
  const valueStop = "Y".charCodeAt(0);

  const letter = String.fromCharCode(Math.floor(valueStart + Math.random() * (valueStop - valueStart + 1)));

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Ce literă este înainte de ${letter}?`,
  ]);

  const questionId = question[0]["id"];

  // Adaug intrebarea specifica
  await query("INSERT INTO questions_prev_letter (id, letter) VALUES ($1, $2)", [questionId, letter]);
};

const createColors = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'colors'"))[0]["id"];
  const colors = await query("SELECT * FROM colors");

  const color = colors[Math.floor(Math.random() * colors.length)]["id"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    "Ce culoare este?",
  ]);

  const questionId = question[0]["id"];

  // Adaug intrebarea specifica
  await query("INSERT INTO questions_colors (id, color_id) VALUES ($1, $2)", [questionId, color]);
};

const createClock = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'clock'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Desenează un ceas care indică ora 10:15!",
  ]);
};

const createPolygon = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'polygon'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Unește punctele ca în imagine!",
  ]);
};

const createChildren = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'children'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [type, userId, "Ai copii?"]);
};

const createBrothers = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'brothers'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [type, userId, "Ai frați?"]);
};

const createSisters = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'sisters'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [type, userId, "Ai surori?"]);
};

const createPets = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'pets'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Ai animale de companie?",
  ]);
};

const createChildrenFollowUp = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'children_follow_up'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [type, userId, "Câți copii ai?"]);
};

const createBrothersFollowUp = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'brothers_follow_up'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [type, userId, "Câți frați ai?"]);
};

const createSistersFollowUp = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'sisters_follow_up'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [type, userId, "Câte surori ai?"]);
};

const createPetsFollowUp = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'pets_follow_up'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Câte animale de companie ai?",
  ]);
};

const createHometown = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'hometown'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Care este orașul tău natal?",
  ]);
};

const createLocation = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'location'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Care este orașul în care locuiești acum?",
  ]);
};

const createMemoryGame = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'memory_game'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Joc de memorie: urmează șablonul prezentat!",
  ]);
};

const createTodayDate = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'today_date'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "În ce dată suntem astăzi?",
  ]);
};

const createSeasonQuestion = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'season'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Ce anotimp este acum?",
  ]);
};

const createCommonWordsNotify = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'common_words_notify'"))[0]["id"];
  const common_words = await query("SELECT * FROM common_words");
  let numberOfElements = 3;
  const selectedElements = [];

  // Selectarea a numberOfElements elemente diferite random
  while (numberOfElements != 0) {
    const element = common_words[Math.floor(Math.random() * common_words.length)]["word"];
    if (!selectedElements.includes(element)) {
      selectedElements.push(element);
      numberOfElements--;
    }
  }

  const elements = selectedElements.join();

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    "Reține următoarea listă de cuvinte: ",
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_common_words_notify (id, words) VALUES ($1, $2)", [questionId, elements]);
};

const createSubtractionNotify = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'subtraction_notify'"))[0]["id"];

  const numbers = [7, 13, 17];
  const number = numbers[Math.floor(Math.random() * numbers.length)];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Scade din 100 numărul ${number}!`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_subtraction_notify (id, number) VALUES ($1, $2)", [questionId, number]);
};

const createSubtraction = async (userId, notifyId, number) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'subtraction'"))[0]["id"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Mai scade ${number} o dată!`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_subtraction (id, notify_id) VALUES ($1, $2)", [questionId, notifyId]);
};

const createBirthday = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'birthday'"))[0]["id"];

  // Adauga intrebarea generica
  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    "Când este ziua ta de naștere?",
  ]);
};

const createDrivingLicence = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'driving_licence'"))[0]["id"];

  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    "Ai permis de conducere?",
  ]);
};

const createCommonWords = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'common_words'"))[0]["id"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    "Îți mai aduci aminte ultimele cuvinte? Care erau acelea?",
  ]);

  const questionId = question[0]["id"];

  // Extrag id-ul notify-ului de prezentare a cuvintelor
  const notifyId = (await query("SELECT * FROM questions_common_words_notify WHERE answers_target != answers"))[0][
    "id"
  ];

  // Adaug intrebarea specifica
  await query("INSERT INTO questions_common_words (id, notify_id) VALUES ($1, $2)", [questionId, notifyId]);
};

const createReversedWord = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'reversed_word'"))[0]["id"];
  const common_words = await query("SELECT * FROM common_words");

  const word = common_words[Math.floor(Math.random() * common_words.length)]["word"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Scrie următorul cuvântul invers: ${word}.`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_reversed_word (id, word) VALUES ($1, $2)", [questionId, word]);
};

const createFaceQuestion = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'face'"))[0]["id"];

  // Extrage toate fetele posibile
  const faces = await query("SELECT f.id FROM faces f JOIN images i ON f.image_id = i.id WHERE user_id = $1", [userId]);

  // Alege o fata random
  const faceId = faces[Math.floor(Math.random() * faces.length)]["id"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    "Care este numele persoanei?",
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_face (id, face_id) VALUES ($1, $2)", [questionId, faceId]);
};

const createAnimal = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'animal'"))[0]["id"];

  // Extrage toate animalele posibile
  const animals = await query("SELECT id FROM animals");

  // Alege un animal random
  const animalId = animals[Math.floor(Math.random() * animals.length)]["id"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    "Ce animal este în imagine?",
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_animal (id, animal_id) VALUES ($1, $2)", [questionId, animalId]);
};

const createDices = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'dices'"))[0]["id"];

  // Extrage toate zarurile posibile
  const dices = await query("SELECT id FROM dices");

  // Alege doua zaruri random
  const firstDiceId = dices[Math.floor(Math.random() * dices.length)]["id"];
  const secondDiceId = dices[Math.floor(Math.random() * dices.length)]["id"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    "Cât este suma zarurilor?",
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_dices (id, first_dice_id, second_dice_id) VALUES ($1, $2, $3)", [
    questionId,
    firstDiceId,
    secondDiceId,
  ]);
};

const createTrafficSign = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'traffic_sign'"))[0]["id"];

  // Extrage toate indicatoarele
  const trafficSigns = await query("SELECT * FROM traffic_signs");

  // Alege un indicator random
  const trafficSignId = trafficSigns[Math.floor(Math.random() * trafficSigns.length)]["id"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    "Ce reprezintă indicatorul din imagine?",
  ]);

  // Extrage restul indicatoarelor
  const trafficSignsRest = await query("SELECT id FROM traffic_signs WHERE id != $1", [trafficSignId]);
  let numberOfElements = 3;
  const selectedElements = [];

  // Selectarea a numberOfElements elemente diferite random
  while (numberOfElements != 0) {
    const element = trafficSignsRest[Math.floor(Math.random() * trafficSignsRest.length)]["id"];

    if (!selectedElements.includes(element)) {
      selectedElements.push(element);
      numberOfElements--;
    }
  }

  const questionId = question[0]["id"];

  // Adauga raspunsurile posibile
  for (let i = 0; i < selectedElements.length; i++) {
    await query("INSERT INTO questions_traffic_sign_choices (id, traffic_signs) VALUES ($1, $2)", [
      questionId,
      selectedElements[i],
    ]);
  }

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_traffic_sign (id, traffic_signs) VALUES ($1, $2)", [questionId, trafficSignId]);
};

const createMaze = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'maze'"))[0]["id"];

  // Extrage toate jocurile
  const mazes = await query("SELECT * FROM mazes");

  // Alege un joc random
  const mazeId = mazes[Math.floor(Math.random() * mazes.length)]["id"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    "Care drum duce la măr?",
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_maze (id, maze_id) VALUES ($1, $2)", [questionId, mazeId]);
};

const createDirectional = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'directional'"))[0]["id"];

  // Extrage toate orasele
  const cities = await query("SELECT * FROM cities");

  // Alege doua orase random
  const leftCity = cities[Math.floor(Math.random() * cities.length)]["id"];
  let rightCity = leftCity;

  while (rightCity === leftCity) {
    rightCity = cities[Math.floor(Math.random() * cities.length)]["id"];
  }

  // Alege un oras din cele doua
  const selectedCities = [leftCity, rightCity];
  const correctCity = selectedCities[Math.floor(Math.random() * selectedCities.length)];

  // Extrage numele orasului
  const cityName = (await query("SELECT name FROM cities WHERE id = $1", [correctCity]))[0]["name"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Ce fac pentru a merge la ${cityName}?`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query(
    "INSERT INTO questions_directional (id, left_city_id, right_city_id, correct_id) VALUES ($1, $2, $3, $4)",
    [questionId, leftCity, rightCity, correctCity]
  );
};

const createLanguage = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'language'"))[0]["id"];

  const languages = await query("SELECT * FROM languages WHERE user_id = $1", [userId]);

  // Alege o limba random
  const language = languages[Math.floor(Math.random() * languages.length)]["id"];

  const languageName = (await query("SELECT * FROM languages WHERE id = $1", [language]))[0]["name"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Cunoști limba ${languageName}?`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_language (id, language_id) VALUES ($1, $2)", [questionId, language]);
};

const createTrafficLight = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'traffic_light'"))[0]["id"];

  const trafficLights = await query("SELECT * FROM traffic_lights");

  // Alege un semafor random
  const trafficLight = trafficLights[Math.floor(Math.random() * trafficLights.length)]["id"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Poți traversa strada?`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_traffic_light (id, traffic_light_id) VALUES ($1, $2)", [questionId, trafficLight]);
};

const createDayOrNight = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'day_or_night'"))[0]["id"];

  // Adauga intrebarea generica
  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [
    type,
    userId,
    `Este zi sau noapte?`,
  ]);
};

const createYear = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'year'"))[0]["id"];

  // Adauga intrebarea generica
  await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3)", [type, userId, `În ce an suntem?`]);
};

const createMusicGenre = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'music_genre'"))[0]["id"];

  const musicGenres = await query("SELECT * FROM music_genres");

  // Alege un gen muzical random
  const musicGenre = musicGenres[Math.floor(Math.random() * musicGenres.length)]["id"];

  const musicGenreName = (await query("SELECT * FROM music_genres WHERE id = $1", [musicGenre]))[0]["genre"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Apreciezi genul muzical ${musicGenreName}?`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_music_genre (id, music_genre_id) VALUES ($1, $2)", [questionId, musicGenre]);
};

const createBook = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'book'"))[0]["id"];

  const books = await query("SELECT * FROM books WHERE user_id = $1", [userId]);

  // Alege o carte random
  const book = books[Math.floor(Math.random() * books.length)]["id"];

  const bookName = (await query("SELECT * FROM books WHERE id = $1", [book]))[0]["name"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Ai citit cartea "${bookName}"?`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_book (id, book_id) VALUES ($1, $2)", [questionId, book]);
};

const createMovie = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'movie'"))[0]["id"];

  const movies = await query("SELECT * FROM movies WHERE user_id = $1", [userId]);

  // Alege un film random
  const movie = movies[Math.floor(Math.random() * movies.length)]["id"];

  const movieName = (await query("SELECT * FROM movies WHERE id = $1", [movie]))[0]["name"];

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Ai văzut "${movieName}"?`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_movie (id, movie_id) VALUES ($1, $2)", [questionId, movie]);
};

const createPost = async (userId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'post'"))[0]["id"];

  const postTypes = await query("SELECT * FROM post_types");

  // Alege un gen muzical random
  const postType = postTypes[Math.floor(Math.random() * postTypes.length)]["id"];

  const postTypeName = (await query("SELECT * FROM post_types WHERE id = $1", [postType]))[0]["name"];

  let translatedPostTypeName = "";
  switch (postTypeName) {
    case "travelling":
      translatedPostTypeName = "călătorie";
      break;
    case "sports":
      translatedPostTypeName = "sport";
      break;
    case "technology":
      translatedPostTypeName = "tehnologie";
      break;
  }

  // Adauga intrebarea generica
  const question = await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
    type,
    userId,
    `Postezi despre ${translatedPostTypeName}?`,
  ]);

  const questionId = question[0]["id"];

  // Adauga detaliile pentru intrebare
  await query("INSERT INTO questions_post (id, post_type) VALUES ($1, $2)", [questionId, postType]);
};

const createMusicGenreFollowUp = async (userId, questionId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'music_genre_follow_up'"))[0]["id"];

  // Extrage id-ul gemnului muzical
  const musicGenreId = (await query("SELECT music_genre_id FROM questions_music_genre WHERE id = $1", [questionId]))[0][
    "music_genre_id"
  ];

  // Extrage aprecierile din genul muzical
  const likes = await query(
    "SELECT name, created_time::date FROM users_music_genres WHERE user_id = $1 AND music_genre_id = $2",
    [userId, musicGenreId]
  );

  if (likes.length != 0) {
    // Alege o apreciere random
    const like = likes[Math.floor(Math.random() * likes.length)];

    const year = new Date(like["created_time"]).getFullYear();
    const name = like["name"];

    // Adauga intrebarea generica
    await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
      type,
      userId,
      `În anul ${year} ai apreciat ${name}!`,
    ]);
  }
};

const createPostFollowUp = async (userId, questionId) => {
  const type = (await query("SELECT * FROM question_types WHERE name = 'post_follow_up'"))[0]["id"];

  // Extrage id-ul tipului de postare
  const postTypeId = (await query("SELECT post_type FROM questions_post WHERE id = $1", [questionId]))[0]["post_type"];

  // Extrage postarile din acest tip
  const posts = await query("SELECT message, created_time::date FROM posts WHERE user_id = $1 AND post_type = $2", [
    userId,
    postTypeId,
  ]);

  if (posts.length != 0) {
    // Alege o postare random
    const post = posts[Math.floor(Math.random() * posts.length)];

    const year = new Date(post["created_time"]).getFullYear();
    const message = post["message"];

    // Adauga intrebarea generica
    await query("INSERT INTO questions (type, user_id, message) VALUES ($1, $2, $3) RETURNING *", [
      type,
      userId,
      `În anul ${year} ai postat: "${message}".`,
    ]);
  }
};

const getImage = async (faceId) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/face/${faceId}`;

  // Cerere catre backend-data pentru a afisa imaginea cu bounding box
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getAnimal = async (animalId) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/animal/${animalId}`;

  // Cerere catre backend-data pentru a afisa imaginea cu bounding box
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getDice = async (diceId) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/dice/${diceId}`;

  // Cerere catre backend-data pentru a afisa imaginea cu bounding box
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const postClock = async (img, imgPath) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/clock?path=${imgPath}`;

  // Cerere catre backend-data pentru a afisa imaginea cu bounding box
  const response = await axios.post(`http://${host}:${port}${path}`, { img: img });

  return response.data;
};

const postPolygon = async (img, imgPath) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/polygon?path=${imgPath}`;

  // Cerere catre backend-data pentru a afisa imaginea cu bounding box
  const response = await axios.post(`http://${host}:${port}${path}`, { img: img });

  return response.data;
};

const getTrafficSign = async (trafficSignId) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/traffic-sign/${trafficSignId}`;

  // Cerere catre backend-data pentru a afisa imaginea cu bounding box
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getTrafficLight = async (trafficLightId) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/traffic-light/${trafficLightId}`;

  // Cerere catre backend-data pentru a afisa imaginea cu bounding box
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getMaze = async (mazeId) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = `/maze/${mazeId}`;

  // Cerere catre backend-data pentru a afisa imaginea cu bounding box
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getAccuracy = async (target, guessed) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = encodeURI(`/words_accuracy?target=${target}&guessed=${guessed}`);

  // Cerere catre backend-data pentru a calcula acuratetea
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getDirectionalImage = async (left, right) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = encodeURI(`/directional?left=${left}&right=${right}`);

  // Cerere catre backend-data pentru a calcula acuratetea
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getColorImage = async (hex) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = encodeURI(`/color?color=${hex}`);

  // Cerere catre backend-data pentru a calcula acuratetea
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const getMatchingTag = async (tags, word) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = encodeURI(`/matching_tag?tags=${tags}&word=${word}`);

  // Cerere catre backend-data pentru a verifica existenta unei potriviri
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
  let letter = "";

  switch (question["type"]) {
    case "face":
      const faceId = (await query("SELECT face_id FROM questions_face WHERE id = $1", [questionId]))[0]["face_id"];
      question["type"] = "text";

      question["image"] = await getImage(faceId);
      break;
    case "common_words_notify":
      const words = (await query("SELECT words FROM questions_common_words_notify WHERE id = $1", [questionId]))[0][
        "words"
      ];
      question["type"] = "confirm";

      const wordsList = words.split(",").join(", ");

      question["message"] += wordsList + "!";
      question["image_type"] = "jpg";
      break;
    case "music_genre_follow_up":
      question["type"] = "confirm";
      break;
    case "post_follow_up":
      question["type"] = "confirm";
      break;
    case "reversed_word":
      question["type"] = "text";
      break;
    case "animal":
      const animalId = (await query("SELECT animal_id FROM questions_animal WHERE id = $1", [questionId]))[0][
        "animal_id"
      ];

      question["type"] = "text";

      question["image"] = await getAnimal(animalId);

      break;
    case "dices":
      const firstDiceId = (await query("SELECT first_dice_id FROM questions_dices WHERE id = $1", [questionId]))[0][
        "first_dice_id"
      ];
      const secondDiceId = (await query("SELECT second_dice_id FROM questions_dices WHERE id = $1", [questionId]))[0][
        "second_dice_id"
      ];

      question["type"] = "text";
      question["images"] = [await getDice(firstDiceId), await getDice(secondDiceId)];

      break;
    case "birthday":
      question["type"] = "date";
      break;
    case "today_date":
      question["type"] = "date";
      break;
    case "clock":
      question["type"] = "clock";
      break;
    case "polygon":
      question["type"] = "polygon";
      break;
    case "hometown":
      question["type"] = "text";
      break;
    case "location":
      question["type"] = "text";
      break;
    case "subtraction_notify":
      question["type"] = "text";
      break;
    case "language":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
    case "year":
      question["type"] = "text";
      break;
    case "day_or_night":
      question["type"] = "choice";
      question["choices"] = ["Zi", "Noapte"];
      break;
    case "music_genre":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
    case "children":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
    case "brothers":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
    case "sisters":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
    case "pets":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
    case "children_follow_up":
      question["type"] = "text";
      break;
    case "brothers_follow_up":
      question["type"] = "text";
      break;
    case "sisters_follow_up":
      question["type"] = "text";
      break;
    case "pets_follow_up":
      question["type"] = "text";
      break;
    case "book":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
    case "change":
      question["type"] = "text";
      break;
    case "money":
      question["type"] = "text";
      break;
    case "next_letter":
      question["type"] = "choice";

      letter = (await query("SELECT letter FROM questions_next_letter WHERE id = $1", [questionId]))[0]["letter"];

      shuffle(
        (question["choices"] = [
          String.fromCharCode(letter.charCodeAt(0) - 2),
          String.fromCharCode(letter.charCodeAt(0) - 1),
          String.fromCharCode(letter.charCodeAt(0) + 1),
          String.fromCharCode(letter.charCodeAt(0) + 2),
        ])
      );
      break;
    case "prev_letter":
      question["type"] = "choice";

      letter = (await query("SELECT letter FROM questions_prev_letter WHERE id = $1", [questionId]))[0]["letter"];

      shuffle(
        (question["choices"] = [
          String.fromCharCode(letter.charCodeAt(0) - 2),
          String.fromCharCode(letter.charCodeAt(0) - 1),
          String.fromCharCode(letter.charCodeAt(0) + 1),
          String.fromCharCode(letter.charCodeAt(0) + 2),
        ])
      );
      break;
    case "directional":
      question["type"] = "choice";
      question["choices"] = ["Stânga", "Dreapta"];

      leftCityName = (
        await query(
          "SELECT c.name FROM questions_directional q JOIN cities c ON q.left_city_id = c.id WHERE q.id = $1",
          [questionId]
        )
      )[0]["name"];

      rightCityName = (
        await query(
          "SELECT c.name FROM questions_directional q JOIN cities c ON q.right_city_id = c.id WHERE q.id = $1",
          [questionId]
        )
      )[0]["name"];

      question["image"] = await getDirectionalImage(leftCityName, rightCityName);

      question["image_type"] = "jpg";
      break;
    case "colors":
      question["type"] = "text";

      colorHex = (
        await query("SELECT c.hex FROM questions_colors q JOIN colors c ON q.color_id = c.id WHERE q.id = $1", [
          questionId,
        ])
      )[0]["hex"];

      question["image"] = await getColorImage(colorHex);

      question["image_type"] = "jpg";
      break;
    case "movie":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
    case "post":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
    case "today":
      const days_of_the_week = await query("SELECT name FROM days_of_the_week");
      question["type"] = "choice";

      question["choices"] = [];

      for (let i = 0; i < days_of_the_week.length; i++) {
        question["choices"].push(days_of_the_week[i]["name"]);
      }

      break;
    case "traffic_light":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];

      trafficLightId = (
        await query("SELECT traffic_light_id from questions_traffic_light WHERE id = $1", [questionId])
      )[0]["traffic_light_id"];

      question["image"] = await getTrafficLight(trafficLightId);

      question["image_type"] = "jpg";
      break;
    case "maze":
      question["type"] = "choice";
      question["choices"] = ["A", "B", "C"];

      mazeId = (await query("SELECT maze_id from questions_maze WHERE id = $1", [questionId]))[0]["maze_id"];

      question["image"] = await getMaze(mazeId);
      question["image_type"] = "png";
      break;
    case "traffic_sign":
      question["type"] = "choice";
      question["choices"] = [];

      const choices = await query(
        "SELECT t.name FROM traffic_signs t JOIN questions_traffic_sign_choices c ON t.id = c.traffic_signs WHERE c.id = $1",
        [questionId]
      );

      for (let i = 0; i < choices.length; i++) {
        question["choices"].push(choices[i].name);
      }

      const correctAnswer = await query(
        "SELECT t.name FROM traffic_signs t JOIN questions_traffic_sign q ON q.traffic_signs = t.id WHERE q.id = $1",
        [questionId]
      );

      question["choices"].push(correctAnswer[0]["name"]);
      shuffle(question["choices"]);

      trafficSignId = (await query("SELECT traffic_signs from questions_traffic_sign WHERE id = $1", [questionId]))[0][
        "traffic_signs"
      ];

      question["image"] = await getTrafficSign(trafficSignId);

      question["image_type"] = "png";

      break;
    case "season":
      const seasons = await query("SELECT name FROM seasons");
      question["type"] = "choice";

      question["choices"] = [];

      for (let i = 0; i < seasons.length; i++) {
        question["choices"].push(seasons[i]["name"]);
      }
      break;
    case "common_words":
      question["type"] = "text";
      break;
    case "subtraction":
      question["type"] = "text";
      break;
    case "memory_game":
      question["type"] = "memory_game";
      break;
    case "driving_licence":
      question["type"] = "choice";
      question["choices"] = ["Da", "Nu"];
      break;
  }

  // Eliminarea campurile care nu sunt necesare
  // delete question.type;

  // Intoarce raspunsul catre client
  return question;
};

const canAnswer = async (userId, questionId) => {
  const questions = await query("SELECT * FROM questions WHERE id = $1 AND user_id = $2 AND answered = FALSE", [
    questionId,
    userId,
  ]);

  return questions.length == 1;
};

const getAnswerType = async (questionId) => {
  const answerType = await query(
    "SELECT a.name as type FROM questions q JOIN question_types t ON q.type = t.id JOIN answer_types a ON t.answer_type = a.id WHERE q.id = $1",
    [questionId]
  );

  return answerType[0]["type"];
};

const confirm = async (questionId) => {
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerToday = async (questionId, choice) => {
  const realDayNo = new Date().getDay();
  const guessDayNo = (await query("SELECT id FROM days_of_the_week WHERE name = $1", [choice]))[0]["id"];

  let correct = true;

  // Verifica corectitudinea raspunsului
  if (realDayNo != guessDayNo) {
    correct = false;
  }

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_today (question_id, day, correct) VALUES ($1, $2, $3)", [
    questionId,
    choice,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerTrafficSign = async (questionId, choice) => {
  const guessTrafficSignId = (await query("SELECT id FROM traffic_signs WHERE name = $1", [choice]))[0]["id"];
  const correctTrafficSignId = (
    await query(
      "SELECT t.id FROM traffic_signs t JOIN questions_traffic_sign q on t.id = q.traffic_signs WHERE q.id = $1",
      [questionId]
    )
  )[0]["id"];

  let correct = true;

  if (guessTrafficSignId != correctTrafficSignId) {
    correct = false;
  }

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_traffic_sign (question_id, name, correct) VALUES ($1, $2, $3)", [
    questionId,
    choice,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerTrafficLight = async (questionId, choice) => {
  const realAnswer = (
    await query(
      "SELECT t.value FROM questions_traffic_light q JOIN traffic_lights t ON q.traffic_light_id = t.id WHERE q.id = $1",
      [questionId]
    )
  )[0]["value"];

  const correct = (choice === "Da") === realAnswer;

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_traffic_light (question_id, name, correct) VALUES ($1, $2, $3)", [
    questionId,
    choice,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerMaze = async (questionId, choice) => {
  const correctAnswer = (
    await query("SELECT m.correct FROM questions_maze q JOIN mazes m ON q.maze_id = m.id WHERE q.id = $1", [questionId])
  )[0]["correct"];

  const correct = choice === correctAnswer;

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_maze (question_id, answer, correct) VALUES ($1, $2, $3)", [
    questionId,
    choice,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerSeason = async (questionId, choice) => {
  const guessSeasonId = (await query("SELECT id FROM seasons WHERE name = $1", [choice]))[0]["id"];
  const realSeasonId = getSeasonId(new Date().getMonth());

  let correct = true;

  // Verifica corectitudinea raspunsului
  if (guessSeasonId != realSeasonId) {
    correct = false;
  }

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_season (question_id, season, correct) VALUES ($1, $2, $3)", [
    questionId,
    choice,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerDrivingLicence = async (questionId, choice) => {
  const userId = (await query("SELECT user_id FROM questions WHERE id = $1", [questionId]))[0]["user_id"];

  // Seteaza campul driving licence
  await query("UPDATE users SET driving_licence = $1 WHERE id = $2", [choice === "Da", userId]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerDayOrNight = async (questionId, choice) => {
  const currentHour = new Date().getUTCHours() + 3;
  let realDayOrNight = "Zi";

  if (currentHour >= 10 && currentHour <= 18) {
    realDayOrNight = "Zi";
  } else if (currentHour >= 22 && currentHour <= 6) {
    isrealDayOrNightDay = "Noapte";
  } else {
    await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
    return;
  }

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_day_or_night (question_id, name, correct) VALUES ($1, $2, $3)", [
    questionId,
    choice,
    choice === realDayOrNight,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerLanguage = async (questionId, choice) => {
  const value = choice === "Da";

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_languages (question_id, value) VALUES ($1, $2)", [questionId, value]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerNextLetter = async (questionId, choice) => {
  const letter = (await query("SELECT letter FROM questions_next_letter WHERE id = $1", [questionId]))[0]["letter"];

  const correct = String.fromCharCode(letter.charCodeAt(0) + 1) == choice;

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_next_letter (question_id, answer, correct) VALUES ($1, $2, $3)", [
    questionId,
    choice,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerPrevLetter = async (questionId, choice) => {
  const letter = (await query("SELECT letter FROM questions_prev_letter WHERE id = $1", [questionId]))[0]["letter"];

  const correct = String.fromCharCode(letter.charCodeAt(0) - 1) == choice;

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_prev_letter (question_id, answer, correct) VALUES ($1, $2, $3)", [
    questionId,
    choice,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerDirectional = async (questionId, choice) => {
  const realIsLeft =
    (
      await query("SELECT COUNT(*) FROM questions_directional WHERE id = $1 AND left_city_id = correct_id", [
        questionId,
      ])
    )[0]["count"] > 0;

  const correct = realIsLeft === (choice === "Stânga");

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_directional (question_id, name, correct) VALUES ($1, $2, $3)", [
    questionId,
    choice,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const choose = async (questionId, choice, userId) => {
  const questionType = (
    await query("SELECT t.name as type FROM questions q JOIN question_types t ON q.type = t.id WHERE q.id = $1", [
      questionId,
    ])
  )[0]["type"];

  switch (questionType) {
    case "today":
      const matchesNoToday = (await query("SELECT * FROM days_of_the_week WHERE name = $1", [choice])).length;

      if (matchesNoToday != 1) {
        throw new ServerError("Invalid day of the week!", 400);
      }

      await answerToday(questionId, choice);

      break;
    case "season":
      const matchesNoSeason = (await query("SELECT * FROM seasons WHERE name = $1", [choice])).length;

      if (matchesNoSeason != 1) {
        throw new ServerError("Invalid season!", 400);
      }

      await answerSeason(questionId, choice);

      break;
    case "driving_licence":
      await answerDrivingLicence(questionId, choice);
      break;
    case "children":
      await answerChildren(questionId, choice, userId);
      break;
    case "brothers":
      await answerBrothers(questionId, choice, userId);
      break;
    case "sisters":
      await answerSisters(questionId, choice, userId);
      break;
    case "pets":
      await answerPets(questionId, choice, userId);
      break;
    case "day_or_night":
      await answerDayOrNight(questionId, choice);
      break;
    case "next_letter":
      await answerNextLetter(questionId, choice);
      break;
    case "prev_letter":
      await answerPrevLetter(questionId, choice);
      break;
    case "language":
      await answerLanguage(questionId, choice);
      break;
    case "directional":
      await answerDirectional(questionId, choice);
      break;
    case "traffic_sign":
      const matchesNoTrafficSign = (await query("SELECT * FROM traffic_signs WHERE name = $1", [choice])).length;

      if (matchesNoTrafficSign != 1) {
        throw new ServerError("Invalid traffic sign!", 400);
      }

      await answerTrafficSign(questionId, choice);

      break;
    case "traffic_light":
      await answerTrafficLight(questionId, choice);
      break;
    case "maze":
      await answerMaze(questionId, choice);
      break;
    case "music_genre":
      await answerMusicGenre(questionId, choice, userId);
      break;
    case "book":
      await answerBook(questionId, choice);
      break;
    case "movie":
      await answerMovie(questionId, choice);
      break;
    case "post":
      await answerPost(questionId, choice, userId);
      break;
  }
};

const answerFace = async (questionId, answer) => {
  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_face (question_id, name) VALUES ($1, $2)", [questionId, answer]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerYear = async (questionId, answer) => {
  const currentYear = new Date().getFullYear();
  const correct = currentYear == answer;

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_year (question_id, name, correct) VALUES ($1, $2, $3)", [
    questionId,
    answer,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerBirthday = async (questionId, date) => {
  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_birthday (question_id, date) VALUES ($1, $2)", [questionId, date]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerTodayDate = async (questionId, date) => {
  const guessDate = new Date(date);
  const correct = guessDate.toDateString() === new Date().toDateString();

  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_today_date (question_id, date, correct) VALUES ($1, $2, $3)", [
    questionId,
    date,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerCommonWords = async (questionId, answer) => {
  // Parseaza lista de cuvinte
  const words = answer.split(new RegExp(",|-| |\\+|\\.")).filter((e) => e.length > 0);

  // Extrage lista de cuvinte initiala
  const realWords = (
    await query(
      "SELECT n.words as words FROM questions q JOIN questions_common_words w ON q.id = w.id JOIN questions_common_words_notify n ON n.id = w.notify_id WHERE q.id = $1",
      [questionId]
    )
  )[0]["words"];

  // Calculez precizia raspunsului
  const accuracy = await getAccuracy(realWords, words);

  // Adaug raspunsul
  await query("INSERT INTO answers_common_words (question_id, text, accuracy) VALUES ($1, $2, $3)", [
    questionId,
    answer,
    accuracy,
  ]);

  // Extrage numarul notificarii
  const notifyId = (
    await query(
      "SELECT n.id as notify_id FROM questions q JOIN questions_common_words w ON q.id = w.id JOIN questions_common_words_notify n ON n.id = w.notify_id WHERE q.id = $1",
      [questionId]
    )
  )[0]["notify_id"];

  // Incrementez numarul de raspunsuri
  await query("UPDATE questions_common_words_notify SET answers = answers + 1 WHERE id = $1", [notifyId]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerSubtractionNotify = async (questionId, answer, userId) => {
  const number = (await query("SELECT number FROM questions_subtraction_notify WHERE id = $1", [questionId]))[0][
    "number"
  ];

  let correct = false;

  if (!isNaN(answer)) {
    // Calculez corectitudinea raspunsului
    correct = 100 - number === Number(answer);
  }

  // Adaug raspunsul
  await query("INSERT INTO answers_subtraction (question_id, correct) VALUES ($1, $2)", [questionId, correct]);

  // Adauga intrebarea urmatoare
  await createSubtraction(userId, questionId, number);

  // Incrementez numarul de raspunsuri
  await query("UPDATE questions_subtraction_notify SET answers = answers + 1 WHERE id = $1", [questionId]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerSubtraction = async (questionId, answer, userId) => {
  // Extrage numarul notificarii
  const notifyId = (
    await query(
      "SELECT n.id as notify_id FROM questions q JOIN questions_subtraction w ON q.id = w.id JOIN questions_subtraction_notify n ON n.id = w.notify_id WHERE q.id = $1",
      [questionId]
    )
  )[0]["notify_id"];

  const { number, answers, answers_target } = (
    await query("SELECT number, answers,answers_target FROM questions_subtraction_notify WHERE id = $1", [notifyId])
  )[0];

  let correct = false;

  if (!isNaN(answer)) {
    // Calculez corectitudinea raspunsului
    correct = 100 - number * (answers + 1) === Number(answer);
  }

  // Adaug raspunsul
  await query("INSERT INTO answers_subtraction (question_id, correct) VALUES ($1, $2)", [questionId, correct]);

  if (answers_target > answers + 1) {
    // Adauga intrebarea urmatoare
    await createSubtraction(userId, notifyId, number);
  }

  // Incrementez numarul de raspunsuri
  await query("UPDATE questions_subtraction_notify SET answers = answers + 1 WHERE id = $1", [notifyId]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerAnimal = async (questionId, answer) => {
  // Parseaza cuvantul
  const name = answer.split(new RegExp(",|-| |\\+|\\.")).filter((e) => e.length > 0)[0];

  // Extrag tag-urile animalului
  const tags = (
    await query(
      "SELECT at.tags FROM questions_animal q JOIN animals a ON q.animal_id = a.id JOIN animal_types at ON a.animal_type = at.id WHERE q.id = $1",
      [questionId]
    )
  )[0]["tags"];

  // Verific daca exista potrivire
  const matchingTag = await getMatchingTag(tags, name);
  const correct = matchingTag === "True";

  // Adaug raspunsul
  await query("INSERT INTO answers_animal (question_id, name, correct) VALUES ($1, $2, $3)", [
    questionId,
    name,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerReversedWord = async (questionId, answer) => {
  const word = (await query("SELECT word FROM questions_reversed_word WHERE id = $1", [questionId]))[0]["word"];
  const correct = sameWord(word.split("").reverse().join(""), answer);

  // Adaug raspunsul
  await query("INSERT INTO answers_reversed_word (question_id, word, correct) VALUES ($1, $2, $3)", [
    questionId,
    answer,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerDices = async (questionId, answer) => {
  // Extrage primul zar
  const firstDiceValue = (
    await query("SELECT d.value FROM questions_dices q JOIN dices d ON q.first_dice_id = d.id WHERE q.id = $1", [
      questionId,
    ])
  )[0]["value"];

  // Extrage al doilea zar
  const secondDiceValue = (
    await query("SELECT d.value FROM questions_dices q JOIN dices d ON q.second_dice_id = d.id WHERE q.id = $1", [
      questionId,
    ])
  )[0]["value"];

  const correctSum = firstDiceValue + secondDiceValue;

  const correct = correctSum === Number(answer);

  // Adaug raspunsul
  await query("INSERT INTO answers_dices (question_id, name, correct) VALUES ($1, $2, $3)", [
    questionId,
    answer,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerHometown = async (questionId, answer, userId) => {
  // Extrage orasul natal
  const realHometown = (await query("SELECT hometown FROM users WHERE id = $1", [userId]))[0]["hometown"];

  const accuracy = await getAccuracy(realHometown, answer);
  const correct = accuracy === 1;

  // Adaug raspunsul
  await query("INSERT INTO answers_hometown (question_id, name, correct) VALUES ($1, $2, $3)", [
    questionId,
    answer,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerColors = async (questionId, answer) => {
  // Extrage culoarea reala
  const realColor = (
    await query("SELECT c.name FROM questions_colors q JOIN colors c ON q.color_id = c.id WHERE q.id = $1", [
      questionId,
    ])
  )[0]["name"];

  const accuracy = await getAccuracy(realColor, answer);
  const correct = accuracy === 1;

  // Adaug raspunsul
  await query("INSERT INTO answers_colors (question_id, answer, correct) VALUES ($1, $2, $3)", [
    questionId,
    answer,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerChange = async (questionId, answer) => {
  const { total, value } = (await query("SELECT total, value FROM questions_change WHERE id = $1", [questionId]))[0];

  const correct = answer.split(" ").includes((total - value).toString());

  // Adaug raspunsul
  await query("INSERT INTO answers_change (question_id, answer, correct) VALUES ($1, $2, $3)", [
    questionId,
    answer,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerMoney = async (questionId, answer) => {
  const { initial, increase } = (
    await query("SELECT initial, increase FROM questions_money WHERE id = $1", [questionId])
  )[0];

  const correct = answer.split(" ").includes((initial + increase).toString());

  // Adaug raspunsul
  await query("INSERT INTO answers_money (question_id, answer, correct) VALUES ($1, $2, $3)", [
    questionId,
    answer,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerChildrenFollowUp = async (questionId, answer) => {
  if (!isNaN(answer)) {
    // Adaug raspunsul
    await query("INSERT INTO answers_children_follow_up (question_id, count) VALUES ($1, $2)", [
      questionId,
      Number(answer),
    ]);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerBrothersFollowUp = async (questionId, answer) => {
  if (!isNaN(answer)) {
    // Adaug raspunsul
    await query("INSERT INTO answers_brothers_follow_up (question_id, count) VALUES ($1, $2)", [
      questionId,
      Number(answer),
    ]);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerSistersFollowUp = async (questionId, answer) => {
  if (!isNaN(answer)) {
    // Adaug raspunsul
    await query("INSERT INTO answers_sisters_follow_up (question_id, count) VALUES ($1, $2)", [
      questionId,
      Number(answer),
    ]);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerPetsFollowUp = async (questionId, answer) => {
  if (!isNaN(answer)) {
    // Adaug raspunsul
    await query("INSERT INTO answers_pets_follow_up (question_id, count) VALUES ($1, $2)", [
      questionId,
      Number(answer),
    ]);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerLocation = async (questionId, answer, userId) => {
  // Extrage orasul natal
  const realLocation = (await query("SELECT location FROM users WHERE id = $1", [userId]))[0]["location"];

  const accuracy = await getAccuracy(realLocation, answer);
  const correct = accuracy === 1;

  // Adaug raspunsul
  await query("INSERT INTO answers_location (question_id, name, correct) VALUES ($1, $2, $3)", [
    questionId,
    answer,
    correct,
  ]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerMusicGenre = async (questionId, answer, userId) => {
  if (answer === "Da") {
    // Adaug raspunsul
    await query("INSERT INTO answers_music_genre (question_id, value) VALUES ($1, TRUE)", [questionId]);
  } else {
    // Adaug raspunsul
    await query("INSERT INTO answers_music_genre (question_id, value) VALUES ($1, FALSE)", [questionId]);

    // Adauga intrebare follow-up
    await createMusicGenreFollowUp(userId, questionId);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerChildren = async (questionId, answer, userId) => {
  if (answer === "Nu") {
    // Adaug raspunsul
    await query("INSERT INTO answers_children (question_id, answer, value) VALUES ($1, $2, TRUE)", [
      questionId,
      answer,
    ]);
  } else {
    // Adaug raspunsul
    await query("INSERT INTO answers_children (question_id, answer, value) VALUES ($1, $2, FALSE)", [
      questionId,
      answer,
    ]);

    // Adauga intrebare follow-up
    await createChildrenFollowUp(userId, questionId);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerBrothers = async (questionId, answer, userId) => {
  if (answer === "Nu") {
    // Adaug raspunsul
    await query("INSERT INTO answers_brothers (question_id, answer, value) VALUES ($1, $2, TRUE)", [
      questionId,
      answer,
    ]);
  } else {
    // Adaug raspunsul
    await query("INSERT INTO answers_brothers (question_id, answer, value) VALUES ($1, $2, FALSE)", [
      questionId,
      answer,
    ]);

    // Adauga intrebare follow-up
    await createBrothersFollowUp(userId, questionId);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerSisters = async (questionId, answer, userId) => {
  if (answer === "Nu") {
    // Adaug raspunsul
    await query("INSERT INTO answers_sisters (question_id, answer, value) VALUES ($1, $2, TRUE)", [questionId, answer]);
  } else {
    // Adaug raspunsul
    await query("INSERT INTO answers_sisters (question_id, answer, value) VALUES ($1, $2, FALSE)", [
      questionId,
      answer,
    ]);

    // Adauga intrebare follow-up
    await createSistersFollowUp(userId, questionId);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerPets = async (questionId, answer, userId) => {
  if (answer === "Nu") {
    // Adaug raspunsul
    await query("INSERT INTO answers_pets (question_id, answer, value) VALUES ($1, $2, TRUE)", [questionId, answer]);
  } else {
    // Adaug raspunsul
    await query("INSERT INTO answers_pets (question_id, answer, value) VALUES ($1, $2, FALSE)", [questionId, answer]);

    // Adauga intrebare follow-up
    await createPetsFollowUp(userId, questionId);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerBook = async (questionId, answer) => {
  await query("INSERT INTO answers_book (question_id, value) VALUES ($1, $2)", [questionId, answer === "Da"]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerMovie = async (questionId, answer) => {
  await query("INSERT INTO answers_movie (question_id, value) VALUES ($1, $2)", [questionId, answer === "Da"]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerPost = async (questionId, answer, userId) => {
  if (answer === "Da") {
    // Adaug raspunsul
    await query("INSERT INTO answers_post (question_id, value) VALUES ($1, TRUE)", [questionId]);
  } else {
    // Adaug raspunsul
    await query("INSERT INTO answers_post (question_id, value) VALUES ($1, FALSE)", [questionId]);

    // Adauga intrebare follow-up
    await createPostFollowUp(userId, questionId);
  }

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answer = async (questionId, answer, userId) => {
  const questionType = (
    await query("SELECT t.name as type FROM questions q JOIN question_types t ON q.type = t.id WHERE q.id = $1", [
      questionId,
    ])
  )[0]["type"];

  switch (questionType) {
    case "face":
      await answerFace(questionId, answer);
      break;
    case "common_words":
      await answerCommonWords(questionId, answer);
      break;
    case "subtraction_notify":
      await answerSubtractionNotify(questionId, answer, userId);
      break;
    case "subtraction":
      await answerSubtraction(questionId, answer, userId);
      break;
    case "animal":
      await answerAnimal(questionId, answer);
      break;
    case "dices":
      await answerDices(questionId, answer);
      break;
    case "hometown":
      await answerHometown(questionId, answer, userId);
      break;
    case "location":
      await answerLocation(questionId, answer, userId);
      break;
    case "year":
      await answerYear(questionId, answer);
      break;
    case "reversed_word":
      await answerReversedWord(questionId, answer);
      break;
    case "change":
      await answerChange(questionId, answer);
      break;
    case "money":
      await answerMoney(questionId, answer);
      break;
    case "children_follow_up":
      await answerChildrenFollowUp(questionId, answer, userId);
      break;
    case "brothers_follow_up":
      await answerBrothersFollowUp(questionId, answer, userId);
      break;
    case "sisters_follow_up":
      await answerSistersFollowUp(questionId, answer, userId);
      break;
    case "pets_follow_up":
      await answerPetsFollowUp(questionId, answer, userId);
      break;
    case "colors":
      await answerColors(questionId, answer);
      break;
  }
};

const date = async (questionId, date) => {
  const questionType = (
    await query("SELECT t.name as type FROM questions q JOIN question_types t ON q.type = t.id WHERE q.id = $1", [
      questionId,
    ])
  )[0]["type"];

  switch (questionType) {
    case "birthday":
      await answerBirthday(questionId, date);
      break;
    case "today_date":
      await answerTodayDate(questionId, date);
      break;
  }
};

const answerMemoryGame = async (questionId, score) => {
  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_memory_game (question_id, score) VALUES ($1, $2)", [questionId, score]);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const score = async (questionId, score) => {
  const questionType = (
    await query("SELECT t.name as type FROM questions q JOIN question_types t ON q.type = t.id WHERE q.id = $1", [
      questionId,
    ])
  )[0]["type"];

  switch (questionType) {
    case "memory_game":
      await answerMemoryGame(questionId, score);
      break;
  }
};

const answerClock = async (questionId, img, userId) => {
  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_clock (question_id, path) VALUES ($1, $2)", [
    questionId,
    `/images/${userId}/clocks/${questionId}.png`,
  ]);

  postClock(img, `/images/${userId}/clocks/${questionId}.png`);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const answerPolygon = async (questionId, img, userId) => {
  // Adauga raspunsul in baza de date
  await query("INSERT INTO answers_polygon (question_id, path) VALUES ($1, $2)", [
    questionId,
    `/images/${userId}/polygons/${questionId}.png`,
  ]);

  postPolygon(img, `/images/${userId}/polygons/${questionId}.png`);

  // Marcheaza intrebarea drept raspunsa
  await query("UPDATE questions SET answered = TRUE WHERE id = $1", [questionId]);
};

const image = async (questionId, img, userId) => {
  const questionType = (
    await query("SELECT t.name as type FROM questions q JOIN question_types t ON q.type = t.id WHERE q.id = $1", [
      questionId,
    ])
  )[0]["type"];

  switch (questionType) {
    case "clock":
      await answerClock(questionId, img, userId);
      break;
    case "polygon":
      await answerPolygon(questionId, img, userId);
      break;
  }
};

module.exports = {
  activeQuestionExists,
  create,
  getActiveQuestion,
  canAnswer,
  getAnswerType,
  confirm,
  choose,
  answer,
  date,
  score,
  image,
};
