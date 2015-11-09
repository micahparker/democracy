/* global _Data */
/* global _IO */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var sessionParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var url = require('url');

var routes = require('./routes/index');
var rooms = require('./routes/rooms');

var app = express();
var socket = require('http').Server(app);
var io = require('socket.io')(socket);

// session setup
app.use(sessionParser());
app.set('trust proxy', 1);
app.use(session({
  secret: 'asdfasdfweqfasdf'
}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//routes
app.use('/', routes);
app.use('/rooms', rooms);

//websockets
socket.listen(3001);
_IO = io;

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error.html', {
    message: err.message,
    error: {}
  });
});

//setup data storage for app
_Data = {
  Rooms: []
};

module.exports = app;
