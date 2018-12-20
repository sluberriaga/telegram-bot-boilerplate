var express = require("express");
var logger = require("morgan");
var bodyParser = require("body-parser");

var index = require("./routes/index");

if (!process.env.TELEGRAM_API_TOKEN) {
  throw new Error("No TELEGRAM_API_TOKEN set in environment variables.");
}

var app = express();

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = app;
