var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var session = require('express-session');

// Load .env for Spotify Client ID and Secret
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var playlistRouter = require('./routes/playlist');

// Deezer router
const deezerRouter = require('./routes/deezer');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/deezer', deezerRouter);
app.use('/api/playlists', playlistRouter);

app.use(session({
  secret: "session secret",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use('/setLogin', function (req, res, next) {
  var isLogin = req.body;
  if (isLogin) {
    req.session.login = true;
    res.send(true);
  } else {
    req.session.login = false;
    res.send(false);
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
