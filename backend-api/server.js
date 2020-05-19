const express = require("express");
const app = express();
const cors = require("cors");
const routes = require("./routes");

const HOST = "0.0.0.0";
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", routes);

app.use("/", (err, req, res, next) => {
  // TODO: remove next line
  console.trace(err);

  let status = 500;
  let message = "Something Bad Happened";

  if (err.httpStatus) {
    status = err.httpStatus;
    message = err.message;
  }

  res.status(status).json({
    error: message,
  });
});

app.listen(PORT, HOST);
