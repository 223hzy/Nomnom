//Setup
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var database = require('./config/database');
var restaurants = require('./models/restaurants');

var fs = require('fs');
var fbAuth = require('./authentication.js');
var passport = require('passport');
var config = require('./oauth.js');
var FacebookStrategy = require('passport-facebook').Strategy;
//mongoose.connect('mongodb://localhost/nomnom');

var routes = require('./routes/index');
var User = require('./models/user');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));




  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // app.use(express.logger());
  // app.use(express.cookieParser());
  // app.use(express.bodyParser());
  // app.use(express.methodOverride());
  // app.use(express.session({ secret: 'my_precious' }));
  app.use(passport.initialize());
  app.use(passport.session());
  // app.use(app.router);
  // app.use(express.static(__dirname + '/public'));


// serialize and deserialize
passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user._id);
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user){
    console.log(user);
    if(!err) done(null, user);
    else done(err, null);
  });
});


// routes
app.use('/', routes);
//app.use('/users', users);
//app.use(express.static('public'));
//app.get('/', routes.index);
app.get('/account', ensureAuthenticated, function(req, res){
  User.findById(req.session.passport.user, function(err, user) {
    if(err) {
      console.log(err);  // handle errors
    } else {
      res.render('account', {user: user});
    }
  });
});

app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function(req, res){});
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/' }),
    function(req, res) {
      res.redirect('/profile');
    });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// test authentication
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}

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
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
