const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const cors = require("cors");
const { initializeDb } = require('./db/ensureDatabase');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors(process.env.NODE_END === "production" ? {
  origin: "https://lechathomedeluna.vercel.app",
  credentials: true
} : {}));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/auth', authRouter);

(async () => {
  try {
    await initializeDb();

  } catch (err) {
    console.error("❌ Erreur DB :", err);
  }
})();

module.exports = app;
