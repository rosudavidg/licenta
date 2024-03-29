const express = require("express");
const router = express.Router();
const UsersService = require("./services.js");
const { authorizeAndExtractToken } = require("../security/JWT/index.js");

const { ServerError } = require("../errors");
const { validateFields, createUser, validateUser, prefetchUser } = require("../utils");
const { generateToken } = require("../security/JWT/index.js");

router.post("/login", async (req, res, next) => {
  let { userId, token } = req.body;
  let status = 200;

  try {
    // Verificarea body-ului
    validateFields({
      userId: {
        value: userId,
        type: "int",
      },
      token: {
        value: token,
        type: "ascii",
      },
    });

    if (!(await UsersService.userExists(userId))) {
      // Daca user-ul nu exista, este inregistrat

      // Se verifica daca este un cont de Facebook valid
      if (!(await validateUser(token, userId))) {
        res.sendStatus(401);
        return;
      }

      // Se creeaza un nou user in baza de date
      await UsersService.create(userId);

      // Se apeleaza prefetch in backend-data
      await prefetchUser(token);

      // Se colecteaza si prelucreaza datele utilizatorului
      createUser(token);

      // Seteaza status Created
      status = 201;
    }

    // TODO: Verifica (userId, token) prin req catre backend-data

    // Se aduce imaginea de profil a utilizatorului
    const profilepic = await UsersService.getProfilepic(userId);

    // Se aduce prenumele utilizatorului
    const firstName = await UsersService.getFirstName(userId);

    // Se genereaza un token JWT care ii este trimis clientului pentru autentificare
    const payload = { userId, profilepic, firstName };
    const JWTtoken = await generateToken(payload);

    // Trimite raspunsul la client, impreuna cu token-ul pentru autentificare
    res.status(status).json(JWTtoken);
  } catch (err) {
    next(err);
  }
});

router.get("/ready", authorizeAndExtractToken, async (req, res, next) => {
  const { userId } = req.state.decoded;

  try {
    const ready = await UsersService.isReady(userId);

    // Trimite raspunsul la client
    res.status(200).json(ready);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
