const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const serverless = require("serverless-http");

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');
const authRouter = require('./routes/auth');
const { initialize } = require('./db');
const cors = require("cors");
const { hashPassword } = require('./services/authService');


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize database and expose via app.locals
initialize().then((db) => {
  app.locals.db = db;
  console.log('Database initialized', hashPassword('Password123'));
}).catch((err) => {
  console.error('Database initialization failed:', err);
});

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);
app.use('/auth', authRouter);

//module.exports = serverless(app);
module.exports = app;
