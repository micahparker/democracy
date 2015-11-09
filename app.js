var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var sessionParser = require('cookie-parser');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var url = require('url');
var loki = require('lokijs');

var routes = require('./routes/index');

var app = express();
var io = require('socket.io');

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

//data storage
var db = new loki('rooms.json');

//websockets
app.io = io();

//routes
app.use('/', routes);
app.use('/rooms', require('./routes/rooms')(app.io, db.addCollection("rooms")));

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

module.exports = app;
