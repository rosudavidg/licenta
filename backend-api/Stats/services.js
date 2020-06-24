const query = require("../database");
const { ServerError } = require("../errors");
const axios = require("axios");

const getMatchingTag = async (tags, word) => {
  const host = process.env.BACKEND_DATA_HOST;
  const port = process.env.BACKEND_DATA_PORT;
  const path = encodeURI(`/matching_tag?tags=${tags}&word=${word}`);

  // Cerere catre backend-data pentru a verifica existenta unei potriviri
  const response = await axios.get(`http://${host}:${port}${path}`);

  return response.data;
};

const hasEnoughNewAnswers = async (userId, lastDate) => {
  return true;
  // Verificare intrebari common words
  const common_words_count = (
    await query(
      "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'common_words_notify' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
      [lastDate, userId]
    )
  )[0]["count"];

  if (common_words_count < 3) return false;

  // Verificare intrebari recunoastere persoane
  const face = (
    await query("SELECT COUNT(*) as count FROM faces f JOIN images i ON f.image_id = i.id WHERE i.user_id = $1", [
      userId,
    ])
  )[0]["count"];

  if (face > 0) {
    const face_count = (
      await query(
        "SELECT f.person_id FROM questions q JOIN questions_face qf ON q.id = qf.id JOIN faces f ON qf.face_id = f.id  WHERE q.created_time > $1 AND q.user_id = $2 GROUP BY f.person_id HAVING count(*) >= 3",
        [lastDate, userId]
      )
    ).length;

    if (face_count < 3) return false;
  }

  // Verificare intrebari anotimp
  const season_count = (
    await query(
      "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'season' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
      [lastDate, userId]
    )
  )[0]["count"];

  if (season_count < 3) return false;

  // Verificare intrebari ziua saptamanii
  const today_count = (
    await query(
      "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'today' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
      [lastDate, userId]
    )
  )[0]["count"];

  if (today_count < 3) return false;

  // Verificare intrebari indicatoare rutiere - doar daca detine permis de conducere
  const driving_licence = (await query("SELECT driving_licence FROM users WHERE id = $1", [userId]))[0][
    "driving_licence"
  ];

  if (driving_licence) {
    const traffic_sign_count = (
      await query(
        "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'traffic_sign' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
        [lastDate, userId]
      )
    )[0]["count"];

    if (traffic_sign_count < 3) return false;
  }

  // Verificare intrebari zi de nastere
  const birthday_count = (
    await query(
      "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'birthday' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
      [lastDate, userId]
    )
  )[0]["count"];

  if (birthday_count < 3) return false;

  // Verificare intrebari data de astazi
  const today_date_count = (
    await query(
      "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'today_date' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
      [lastDate, userId]
    )
  )[0]["count"];

  if (today_date_count < 3) return false;

  // Verificare intrebari recunoastere animale
  const animal_count = (
    await query(
      "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'animal' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
      [lastDate, userId]
    )
  )[0]["count"];

  if (animal_count < 3) return false;

  // Verificare intrebari joc de memorie
  const memory_game_count = (
    await query(
      "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'memory_game' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
      [lastDate, userId]
    )
  )[0]["count"];

  if (memory_game_count < 3) return false;

  // Verificare intrebari zaruri
  const dices_count = (
    await query(
      "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'dices' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
      [lastDate, userId]
    )
  )[0]["count"];

  if (dices_count < 3) return false;

  // Verificare intrebari desene ceas
  const clock_count = (
    await query(
      "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'clock' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
      [lastDate, userId]
    )
  )[0]["count"];

  if (clock_count < 3) return false;

  // Verificare intrebari oras natal
  const hometown = (await query("SELECT count(*) FROM users WHERE id = $1 AND hometown IS NOT NULL", [userId]))[0][
    "count"
  ];

  if (hometown == 1) {
    const hometown_count = (
      await query(
        "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'hometown' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
        [lastDate, userId]
      )
    )[0]["count"];

    if (hometown_count < 3) return false;
  }

  // Verificare intrebari locatia curenta
  const location = (await query("SELECT count(*) FROM users WHERE id = $1 AND location IS NOT NULL", [userId]))[0][
    "count"
  ];

  if (location == 1) {
    const location_count = (
      await query(
        "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'location' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
        [lastDate, userId]
      )
    )[0]["count"];

    if (location_count < 3) return false;
  }

  // Verific daca exista cel putin o limba
  const languages = (await query("SELECT COUNT(*) FROM languages WHERE user_id = $1", [userId]))[0]["count"];
  if (languages > 0) {
    const languages_count = (
      await query(
        "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'language' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
        [lastDate, userId]
      )
    )[0]["count"];

    if (languages_count < 3) return false;
  }

  // Verific daca exista cel putin un gen muzical
  const musicGenres = (await query("SELECT COUNT(*) FROM users_music_genres WHERE user_id = $1", [userId]))[0]["count"];
  if (musicGenres > 0) {
    const music_count = (
      await query(
        "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'music_genre' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
        [lastDate, userId]
      )
    )[0]["count"];

    if (music_count < 3) return false;
  }

  // Verific daca exista cel putin o postare
  const posts = (await query("SELECT COUNT(*) FROM posts WHERE user_id = $1", [userId]))[0]["count"];
  if (posts > 0) {
    const posts_count = (
      await query(
        "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'post' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
        [lastDate, userId]
      )
    )[0]["count"];

    if (posts_count < 3) return false;
  }

  // Verific daca exista cel putin o carte
  const books = (await query("SELECT COUNT(*) FROM books WHERE user_id = $1", [userId]))[0]["count"];
  if (books > 0) {
    const books_count = (
      await query(
        "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'book' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
        [lastDate, userId]
      )
    )[0]["count"];

    if (books_count < 3) return false;
  }

  // Verific daca exista cel putin un film
  const movies = (await query("SELECT COUNT(*) FROM movies WHERE user_id = $1", [userId]))[0]["count"];
  if (movies > 0) {
    const movies_count = (
      await query(
        "SELECT COUNT(*) FROM questions q JOIN question_types t ON q.type = t.id WHERE t.name = 'movie' AND q.created_time > $1 AND q.user_id = $2 AND answered = TRUE",
        [lastDate, userId]
      )
    )[0]["count"];

    if (movies_count < 3) return false;
  }

  // TODO: adauga cerinte pentru noile intrebari

  // TODO: modifica numarul de raspunsuri necesare la 1

  return true;
};

const computeSeasonAcc = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_season a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_season a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeTodayAcc = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_today a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_today a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeTrafficSignAcc = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_traffic_sign a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_traffic_sign a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeTodayDateAcc = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_today_date a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_today_date a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeAnimalsAcc = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_animal a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_animal a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeDicesAcc = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_dices a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_dices a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeClockAcc = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_clock a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_clock a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeHometownAcc = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_hometown a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_hometown a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeLocationAcc = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_location a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_location a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeMemoryGameAcc = async (userId, startDate) => {
  // Calculare scorul total
  const score = (
    await query(
      "SELECT SUM(score) as score FROM answers_memory_game a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["score"];

  // Calculare scorul maxim
  const max_score =
    (
      await query(
        "SELECT COUNT(*) FROM answers_memory_game a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
        [userId, startDate]
      )
    )[0]["count"] * 4;

  if (max_score == 0) return undefined;

  // Calculare precizie
  return score / max_score;
};

const computeLanguageAcc = async (userId, startDate) => {
  // Calculare raspunsuri pozitive
  const positive = await query(
    "SELECT ql.language_id, count(ql.language_id) FROM answers_languages a JOIN questions q ON a.question_id = q.id JOIN questions_language ql ON ql.id = q.id WHERE q.user_id = $1 AND a.value = TRUE AND q.created_time::date >= $2 GROUP BY ql.language_id;",
    [userId, startDate]
  );

  // Calculare raspunsuri totale
  const total = await query(
    "SELECT ql.language_id, count(ql.language_id) FROM answers_languages a JOIN questions q ON a.question_id = q.id JOIN questions_language ql ON ql.id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY ql.language_id;",
    [userId, startDate]
  );

  if (total.length == 0) return undefined;

  let globalAcc = 0;
  let globalCount = 0;
  let i = 0;
  let j = 0;

  for (i = 0; i < total.length; i++) {
    for (j = 0; j < positive.length; j++) {
      if (total[i]["language_id"] === positive[j]["language_id"]) {
        const totalCount = total[i]["count"];
        const positiveCount = positive[j]["count"];
        const negativeCount = totalCount - positiveCount;
        let acc = 0;

        if (positiveCount > negativeCount) {
          acc = positiveCount / totalCount;
        } else {
          acc = negativeCount / totalCount;
        }

        globalAcc += acc;
        globalCount++;
        break;
      }
    }

    if (j == positive.length) {
      globalAcc += 1;
      globalCount++;
    }
  }

  return globalAcc / globalCount;
};

const computeMusicAcc = async (userId, startDate) => {
  // Calculare raspunsuri pozitive
  const positive = await query(
    "SELECT qm.music_genre_id, count(qm.music_genre_id) FROM answers_music_genre a JOIN questions q ON a.question_id = q.id JOIN questions_music_genre qm ON qm.id = q.id WHERE q.user_id = $1 AND a.value = TRUE AND q.created_time::date >= $2 GROUP BY qm.music_genre_id;",
    [userId, startDate]
  );

  // Calculare raspunsuri totale
  const total = await query(
    "SELECT qm.music_genre_id, count(qm.music_genre_id) FROM answers_music_genre a JOIN questions q ON a.question_id = q.id JOIN questions_music_genre qm ON qm.id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY qm.music_genre_id;",
    [userId, startDate]
  );

  if (total.length == 0) return undefined;

  let globalAcc = 0;
  let globalCount = 0;
  let i = 0;
  let j = 0;

  for (i = 0; i < total.length; i++) {
    for (j = 0; j < positive.length; j++) {
      if (total[i]["music_genre_id"] === positive[j]["music_genre_id"]) {
        const totalCount = total[i]["count"];
        const positiveCount = positive[j]["count"];
        const negativeCount = totalCount - positiveCount;
        let acc = 0;

        if (positiveCount > negativeCount) {
          acc = positiveCount / totalCount;
        } else {
          acc = negativeCount / totalCount;
        }

        globalAcc += acc;
        globalCount++;
        break;
      }
    }

    if (j == positive.length) {
      globalAcc += 1;
      globalCount++;
    }
  }

  return globalAcc / globalCount;
};

const computePostAcc = async (userId, startDate) => {
  // Calculare raspunsuri pozitive
  const positive = await query(
    "SELECT qp.post_type, count(qp.post_type) FROM answers_post a JOIN questions q ON a.question_id = q.id JOIN questions_post qp ON qp.id = q.id WHERE q.user_id = $1 AND a.value = TRUE AND q.created_time::date >= $2 GROUP BY qp.post_type;",
    [userId, startDate]
  );

  // Calculare raspunsuri totale
  const total = await query(
    "SELECT qp.post_type, count(qp.post_type) FROM answers_post a JOIN questions q ON a.question_id = q.id JOIN questions_post qp ON qp.id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY qp.post_type;",
    [userId, startDate]
  );

  if (total.length == 0) return undefined;

  let globalAcc = 0;
  let globalCount = 0;
  let i = 0;
  let j = 0;

  for (i = 0; i < total.length; i++) {
    for (j = 0; j < positive.length; j++) {
      if (total[i]["post_type"] === positive[j]["post_type"]) {
        const totalCount = total[i]["count"];
        const positiveCount = positive[j]["count"];
        const negativeCount = totalCount - positiveCount;
        let acc = 0;

        if (positiveCount > negativeCount) {
          acc = positiveCount / totalCount;
        } else {
          acc = negativeCount / totalCount;
        }

        globalAcc += acc;
        globalCount++;
        break;
      }
    }

    if (j == positive.length) {
      globalAcc += 1;
      globalCount++;
    }
  }

  return globalAcc / globalCount;
};

const computeBookAcc = async (userId, startDate) => {
  // Calculare raspunsuri pozitive
  const positive = await query(
    "SELECT qb.book_id, count(qb.book_id) FROM answers_book a JOIN questions q ON a.question_id = q.id JOIN questions_book qb ON qb.id = q.id WHERE q.user_id = $1 AND a.value = TRUE AND q.created_time::date >= $2 GROUP BY qb.book_id;",
    [userId, startDate]
  );

  // Calculare raspunsuri totale
  const total = await query(
    "SELECT qb.book_id, count(qb.book_id) FROM answers_book a JOIN questions q ON a.question_id = q.id JOIN questions_book qb ON qb.id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY qb.book_id;",
    [userId, startDate]
  );

  if (total.length == 0) return undefined;

  let globalAcc = 0;
  let globalCount = 0;
  let i = 0;
  let j = 0;

  for (i = 0; i < total.length; i++) {
    for (j = 0; j < positive.length; j++) {
      if (total[i]["book_id"] === positive[j]["book_id"]) {
        const totalCount = total[i]["count"];
        const positiveCount = positive[j]["count"];
        const negativeCount = totalCount - positiveCount;
        let acc = 0;

        if (positiveCount > negativeCount) {
          acc = positiveCount / totalCount;
        } else {
          acc = negativeCount / totalCount;
        }

        globalAcc += acc;
        globalCount++;
        break;
      }
    }

    if (j == positive.length) {
      globalAcc += 1;
      globalCount++;
    }
  }

  return globalAcc / globalCount;
};

const computeMovieAcc = async (userId, startDate) => {
  // Calculare raspunsuri pozitive
  const positive = await query(
    "SELECT qm.movie_id, count(qm.movie_id) FROM answers_movie a JOIN questions q ON a.question_id = q.id JOIN questions_movie qm ON qm.id = q.id WHERE q.user_id = $1 AND a.value = TRUE AND q.created_time::date >= $2 GROUP BY qm.movie_id;",
    [userId, startDate]
  );

  // Calculare raspunsuri totale
  const total = await query(
    "SELECT qm.movie_id, count(qm.movie_id) FROM answers_movie a JOIN questions q ON a.question_id = q.id JOIN questions_movie qm ON qm.id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY qm.movie_id;",
    [userId, startDate]
  );

  if (total.length == 0) return undefined;

  let globalAcc = 0;
  let globalCount = 0;
  let i = 0;
  let j = 0;

  for (i = 0; i < total.length; i++) {
    for (j = 0; j < positive.length; j++) {
      if (total[i]["movie_id"] === positive[j]["movie_id"]) {
        const totalCount = total[i]["count"];
        const positiveCount = positive[j]["count"];
        const negativeCount = totalCount - positiveCount;
        let acc = 0;

        if (positiveCount > negativeCount) {
          acc = positiveCount / totalCount;
        } else {
          acc = negativeCount / totalCount;
        }

        globalAcc += acc;
        globalCount++;
        break;
      }
    }

    if (j == positive.length) {
      globalAcc += 1;
      globalCount++;
    }
  }

  return globalAcc / globalCount;
};

const average = (list) => {
  let sum = 0;
  let count = 0;

  for (let i = 0; i < list.length; i++) {
    if (list[i] != undefined) {
      sum += list[i];
      count++;
    }
  }

  if (count == 0) {
    return 1;
  }

  return sum / count;
};

const computeBirthdayAcc = async (userId, startDate) => {
  // Verific daca exista birthday asociat utilizatorului
  const realBirthdayExists =
    (await query("SELECT COUNT(*) FROM users WHERE id = $1 AND birthday IS NOT NULL", [userId]))[0]["count"] == 1;

  // Daca exista ziua de nastere, o consider pe aceasta corecta
  if (realBirthdayExists) {
    const realBirthday = (await query("SELECT birthday FROM users WHERE id = $1", [userId]))[0]["birthday"];
    const correctCount = (
      await query(
        "SELECT COUNT(*) FROM answers_birthday a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND a.date = $2 AND q.created_time::date >= $3",
        [userId, realBirthday, startDate]
      )
    )[0]["count"];
    const totalCount = (
      await query(
        "SELECT COUNT(*) FROM answers_birthday a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
        [userId, startDate]
      )
    )[0]["count"];

    if (totalCount == 0) return undefined;

    return correctCount / totalCount;
  }

  // Daca nu exista, voi alege raspunsul majoritar
  const averageCount = (
    await query(
      "SELECT count(*) as count FROM answers_birthday a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY date ORDER BY count DESC LIMIT 1",
      [userId, startDate]
    )
  )[0]["count"];

  const totalCount = (
    await query(
      "SELECT COUNT(*) FROM answers_birthday a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (totalCount == 0) return undefined;

  return averageCount / totalCount;
};

const computeCommonWordsAcc = async (userId, startDate) => {
  // Extragerea tuturor preciziilor din baza de date
  const accuracies = await query(
    "SELECT * FROM answers_common_words a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
    [userId, startDate]
  );

  if (accuracies.length == 0) return undefined;

  // Calculare precizie
  let sum = 0;
  let count = 0;

  for (let i = 0; i < accuracies.length; i++) {
    sum += accuracies[i]["accuracy"];
    count++;
  }

  return sum / count;
};

const computeFaceAcc = async (userId, startDate) => {
  // Extrage toate raspunsurile valide
  const faces = await query(
    "SELECT * FROM answers_face a JOIN questions q ON a.question_id = q.id JOIN questions_face qf ON qf.id = q.id JOIN faces f ON f.id = qf.face_id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND lower(a.name) NOT IN ('eu', 'sunt eu', 'eu sunt')",
    [userId, startDate]
  );

  if (faces.length == 0) return undefined;

  // Impartire dupa persoane
  const persons = {};

  for (let i = 0; i < faces.length; i++) {
    if (faces[i]["name"] != "")
      if (faces[i]["person_id"] in persons) {
        persons[faces[i]["person_id"]].push(faces[i]["name"]);
      } else {
        persons[faces[i]["person_id"]] = [faces[i]["name"]];
      }
  }

  // Calculare precizie
  let sum = 0;
  let count = 0;

  // Pentru fiecare persoana se calculeaza precizia de recunoastere
  for (let person in persons) {
    // Lista de nume gasite
    const nameLists = [];

    // Pentru fiecare nume, il adaug in lista de nume gasite
    for (let i = 0; i < persons[person].length; i++) {
      const currentName = persons[person][i];

      // Verific daca poate fi adaugat intr-o lista deja existenta
      let done = false;

      for (let j = 0; j < nameLists.length; j++) {
        const list = nameLists[j];

        if (done) break;

        if ((await getMatchingTag(list.join(","), currentName)) == "True") {
          // Cuvantul este adaugat in lista
          list.push(currentName);
          done = true;
        }
      }

      if (!done) {
        // Se construieste o lista noua cu numele curent
        nameLists.push([currentName]);
      }
    }

    // Se calculeaza numarul maxim de elemente din liste
    const maxElements = Math.max(...nameLists.map((e) => e.length));

    // Calculare precizie persoana curenta
    const acc = maxElements / persons[person].length;
    sum += acc;
    count++;
  }

  // Adauga persoanele care au doar campuri vide
  for (let i = 0; i < faces.length; i++) {
    if (!(faces[i]["person_id"] in persons)) {
      count++;
    }
  }

  //   Calculare precizie totala
  return sum / count;
};

const computeDayOrNight = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_day_or_night a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_day_or_night a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeTrafficLight = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_traffic_light a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_traffic_light a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeDirectional = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_directional a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_directional a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeYear = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_year a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_year a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeReversedWord = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_reversed_word a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_reversed_word a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeChange = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_change a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_change a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeNextLetter = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_next_letter a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_next_letter a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computePrevLetter = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_prev_letter a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_prev_letter a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeChildren = async (userId, startDate) => {
  // Calculare numar de raspunsuri pozitive
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_children a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.value = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_children a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  if (correct < total / 2) return (total - correct) / total;

  // Calculare precizie
  return correct / total;
};

const computeBrothers = async (userId, startDate) => {
  // Calculare numar de raspunsuri pozitive
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_brothers a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.value = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_brothers a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  if (correct < total / 2) return (total - correct) / total;

  // Calculare precizie
  return correct / total;
};

const computeSisters = async (userId, startDate) => {
  // Calculare numar de raspunsuri pozitive
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_sisters a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.value = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_sisters a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  if (correct < total / 2) return (total - correct) / total;

  // Calculare precizie
  return correct / total;
};

const computePets = async (userId, startDate) => {
  // Calculare numar de raspunsuri pozitive
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_pets a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.value = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_pets a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  if (correct < total / 2) return (total - correct) / total;

  // Calculare precizie
  return correct / total;
};

const computeChildrenFollowUp = async (userId, startDate) => {
  const totalCount = (
    await query(
      "SELECT COUNT(*) FROM answers_children_follow_up a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (totalCount == 0) return undefined;

  const averageCount = (
    await query(
      "SELECT count(*) as cnt FROM answers_children_follow_up a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY count ORDER BY cnt DESC LIMIT 1",
      [userId, startDate]
    )
  )[0]["cnt"];

  return averageCount / totalCount;
};

const computeBrothersFollowUp = async (userId, startDate) => {
  const totalCount = (
    await query(
      "SELECT COUNT(*) FROM answers_brothers_follow_up a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (totalCount == 0) return undefined;

  const averageCount = (
    await query(
      "SELECT count(*) as cnt FROM answers_brothers_follow_up a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY count ORDER BY cnt DESC LIMIT 1",
      [userId, startDate]
    )
  )[0]["cnt"];

  return averageCount / totalCount;
};

const computeSistersFollowUp = async (userId, startDate) => {
  const totalCount = (
    await query(
      "SELECT COUNT(*) FROM answers_sisters_follow_up a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (totalCount == 0) return undefined;

  const averageCount = (
    await query(
      "SELECT count(*) as cnt FROM answers_sisters_follow_up a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY count ORDER BY cnt DESC LIMIT 1",
      [userId, startDate]
    )
  )[0]["cnt"];

  return averageCount / totalCount;
};

const computePetsFollowUp = async (userId, startDate) => {
  const averageCount = (
    await query(
      "SELECT count(*) as cnt FROM answers_pets_follow_up a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 GROUP BY count ORDER BY cnt DESC LIMIT 1",
      [userId, startDate]
    )
  )[0]["cnt"];

  const totalCount = (
    await query(
      "SELECT COUNT(*) FROM answers_pets_follow_up a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (totalCount == 0) return undefined;

  return averageCount / totalCount;
};

const computeColors = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_colors a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_colors a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeSubtraction = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_subtraction a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_subtraction a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeMoney = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_money a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_money a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computePolygon = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_polygon a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_polygon a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const computeMaze = async (userId, startDate) => {
  // Calculare numar de raspunsuri corecte
  const correct = (
    await query(
      "SELECT COUNT(*) FROM answers_maze a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2 AND a.correct = TRUE",
      [userId, startDate]
    )
  )[0]["count"];

  // Calculare numar de raspunsuri totale
  const total = (
    await query(
      "SELECT COUNT(*) FROM answers_maze a JOIN questions q ON a.question_id = q.id WHERE q.user_id = $1 AND q.created_time::date >= $2",
      [userId, startDate]
    )
  )[0]["count"];

  if (total == 0) return undefined;

  // Calculare precizie
  return correct / total;
};

const createStats = async (userId, statsId, startDate) => {
  const accCommonWords = await computeCommonWordsAcc(userId, startDate);
  const accFace = await computeFaceAcc(userId, startDate);
  const accSeason = await computeSeasonAcc(userId, startDate);
  const accToday = await computeTodayAcc(userId, startDate);
  const accTrafficSign = await computeTrafficSignAcc(userId, startDate);
  const accBirthday = await computeBirthdayAcc(userId, startDate);
  const accTodayDate = await computeTodayDateAcc(userId, startDate);
  const accAnimals = await computeAnimalsAcc(userId, startDate);
  const accMemoryGame = await computeMemoryGameAcc(userId, startDate);
  const accDices = await computeDicesAcc(userId, startDate);
  const accClock = await computeClockAcc(userId, startDate);
  const accHometown = await computeHometownAcc(userId, startDate);
  const accLocation = await computeLocationAcc(userId, startDate);
  const accLanguage = await computeLanguageAcc(userId, startDate);
  const accMusic = await computeMusicAcc(userId, startDate);
  const accPost = await computePostAcc(userId, startDate);
  const accBook = await computeBookAcc(userId, startDate);
  const accMovie = await computeMovieAcc(userId, startDate);
  const accDayOrNight = await computeDayOrNight(userId, startDate);
  const accTrafficLight = await computeTrafficLight(userId, startDate);
  const accDirectional = await computeDirectional(userId, startDate);
  const accYear = await computeYear(userId, startDate);
  const accReversedWord = await computeReversedWord(userId, startDate);
  const accChange = await computeChange(userId, startDate);
  const accNextLetter = await computeNextLetter(userId, startDate);
  const accPrevLetter = await computePrevLetter(userId, startDate);
  const accChildren = await computeChildren(userId, startDate);
  const accBrothers = await computeBrothers(userId, startDate);
  const accSisters = await computeSisters(userId, startDate);
  const accPets = await computePets(userId, startDate);
  const accChildrenFollowUp = await computeChildrenFollowUp(userId, startDate);
  const accBrothersFollowUp = await computeBrothersFollowUp(userId, startDate);
  const accSistersFollowUp = await computeSistersFollowUp(userId, startDate);
  const accPetsFollowUp = await computePetsFollowUp(userId, startDate);
  const accColors = await computeColors(userId, startDate);
  const accSubtraction = await computeSubtraction(userId, startDate);
  const accMoney = await computeMoney(userId, startDate);
  const accPolygon = await computePolygon(userId, startDate);
  const accMaze = await computeMaze(userId, startDate);

  const accShortTermMemory = average([
    accCommonWords,
    accMemoryGame,
    accReversedWord,
    accChange,
    accSubtraction,
    accMoney,
    accPolygon,
    accMaze,
  ]);
  const accLongTermMemory = average([
    accFace,
    accSeason,
    accToday,
    accTrafficSign,
    accBirthday,
    accTodayDate,
    accAnimals,
    accDices,
    accClock,
    accHometown,
    accLocation,
    accLanguage,
    accMusic,
    accPost,
    accBook,
    accMovie,
    accDayOrNight,
    accTrafficLight,
    accDirectional,
    accYear,
    accNextLetter,
    accPrevLetter,
    accChildren,
    accBrothers,
    accSisters,
    accPets,
    accChildrenFollowUp,
    accBrothersFollowUp,
    accSistersFollowUp,
    accPetsFollowUp,
    accColors,
  ]);

  const accTotal = average([
    accCommonWords,
    accFace,
    accSeason,
    accToday,
    accTrafficSign,
    accBirthday,
    accTodayDate,
    accAnimals,
    accMemoryGame,
    accDices,
    accClock,
    accHometown,
    accLocation,
    accLanguage,
    accMusic,
    accPost,
    accBook,
    accMovie,
    accDayOrNight,
    accTrafficLight,
    accDirectional,
    accYear,
    accReversedWord,
    accChange,
    accNextLetter,
    accPrevLetter,
    accChildren,
    accBrothers,
    accSisters,
    accPets,
    accChildrenFollowUp,
    accBrothersFollowUp,
    accSistersFollowUp,
    accPetsFollowUp,
    accColors,
    accSubtraction,
    accMoney,
    accPolygon,
    accMaze,
  ]);

  // Actualizeaza rezultatele in baza de date
  await query(
    "UPDATE stats SET ready = TRUE, acc_total = $1, acc_short_term_memory = $2, acc_long_term_memory = $3, acc_common_words = $4, acc_face = $5, acc_season = $6, acc_today = $7,  acc_traffic_sign = $8, acc_birthday = $9, acc_today_date = $10, acc_animals = $11, acc_memory_game = $12, acc_dices = $13, acc_clock = $14, acc_hometown = $15, acc_location = $16, acc_language = $17, acc_music_genre = $18, acc_post = $19, acc_book = $20, acc_movie = $21, acc_day_or_night = $22, acc_traffic_light = $23, acc_directional = $24, acc_year = $25, acc_reversed_word = $26, acc_change = $27, acc_next_letter = $28, acc_prev_letter = $29, acc_children = $30, acc_brothers = $31, acc_sisters = $32, acc_pets = $33, acc_children_follow_up = $34, acc_brothers_follow_up = $35, acc_sisters_follow_up = $36, acc_pets_follow_up = $37, acc_colors = $38, acc_subtraction = $39, acc_money = $40, acc_polygon = $41, acc_maze = $42 WHERE id = $43",
    [
      accTotal,
      accShortTermMemory,
      accLongTermMemory,
      accCommonWords,
      accFace,
      accSeason,
      accToday,
      accTrafficSign,
      accBirthday,
      accTodayDate,
      accAnimals,
      accMemoryGame,
      accDices,
      accClock,
      accHometown,
      accLocation,
      accLanguage,
      accMusic,
      accPost,
      accBook,
      accMovie,
      accDayOrNight,
      accTrafficLight,
      accDirectional,
      accYear,
      accReversedWord,
      accChange,
      accNextLetter,
      accPrevLetter,
      accChildren,
      accBrothers,
      accSisters,
      accPets,
      accChildrenFollowUp,
      accBrothersFollowUp,
      accSistersFollowUp,
      accPetsFollowUp,
      accColors,
      accSubtraction,
      accMoney,
      accPolygon,
      accMaze,
      statsId,
    ]
  );
};

const canCreateStats = async (userId) => {
  const lastDate = await getLastStatsDate(userId);

  // Calculare diferenta
  const differenceTimeInDays = (new Date().getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

  // Verific daca au trecut cel putin 7 zile
  if (differenceTimeInDays < 7) return false;

  // Verific daca exista date noi suficiente pentru a adauga o statistica
  return hasEnoughNewAnswers(userId, lastDate);
};

const getLastStatsDate = async (userId) => {
  let lastDate = undefined;

  // Selectarea tuturor statisticilor
  const stats = await query("SELECT * FROM stats WHERE user_id = $1 ORDER BY end_date DESC", [userId]);

  // Daca nu exista statistici, data va fi data inregistrarii pe platforma
  if (stats.length == 0) {
    lastDate = new Date(
      (await query("SELECT timestamp_created::date FROM users WHERE id = $1", [userId]))[0]["timestamp_created"]
    );
  } else {
    lastDate = new Date(stats[0]["end_date"]);
  }

  return lastDate;
};

const createStatsEntry = async (userId) => {
  const lastDate = await getLastStatsDate(userId);

  // Calculare start date
  const startDate = new Date(lastDate.getTime() + 1000 * 60 * 60 * 24);

  // Calculare end date
  const endDate = new Date();

  // Adaugare statistica in baza de date
  const statsId = (
    await query("INSERT INTO stats (user_id, start_date, end_date) VALUES ($1, $2, $3) RETURNING *", [
      userId,
      startDate,
      endDate,
    ])
  )[0]["id"];

  // Calcularea rezultatelor in mod asincron
  createStats(userId, statsId, startDate);
};

const availableStats = async (userId) => {
  const noStats = (await query("SELECT COUNT(*) FROM stats WHERE user_id = $1 AND ready = TRUE", [userId]))[0]["count"];

  return noStats > 0;
};

const getStats = async (userId) => {
  const stats = await query("SELECT * FROM stats WHERE user_id = $1 AND ready = TRUE ORDER BY id ASC", [userId]);

  if (stats.length == 0) {
    throw new ServerError("Cannot find stats.", 400);
  }

  return stats;
};

module.exports = {
  canCreateStats,
  createStatsEntry,
  availableStats,
  getStats,
};
