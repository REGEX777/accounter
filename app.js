//dotenv
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const colors = require('colors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const flash = require('express-flash');

//mongoose connection
mongoose.connect('mongodb://localhost:27017/accounterDB', {useNewUrlParser: true},function(err){
    if(err){
        console.log("❗ | "+err.red);
    }else{
        console.log("⚙ | Connected to Database Succesfully.".green);
    }
});
//schemas
const userSchema = new mongoose.Schema({ 
    username: String,
    email: String,
    password: String
})
const dataSchema = new mongoose.Schema({
    date: String,
    income: Number,
    expense: Number,
    belongsTo: String
})

//models
const User = mongoose.model('User', userSchema);
const Data = mongoose.model('Data', dataSchema);


//intialize express
const app = express();
//intialize body-parser
app.use(bodyParser.urlencoded({extended: true}));
//set view engine
app.set('view engine', 'ejs');
//set public folder
app.use(express.static('public'));
//session
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));
//app use passport
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    done(null, user.id);
})
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//startegy
//login strategy
passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
      },function (email, password, done) {
      User.findOne({ email: email }, function (err, user) {
          if (err) return done(err);
          if (!user) return done(null, console.log('dog'), false, { message: 'Incorrect Email!' });
          bcrypt.compare(password, user.password, function (err, res) {
              if (err) return done(err);
              if (res === false) return done(null, false, { message: 'Incorrect Password!' });
              
              return done(null, user);
          });
      });
  })); 
  //signup startegy passport js
    passport.use(
        'local-signup',
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            function(req, email, password, done) {
                process.nextTick(function() {
                    User.findOne({ email: email },async function(err, user) {
                        if (err) return done(err);
                        if (user) return done(null, false, {message: 'Email Already In Use!'});
                        const newUser = new User();
                        newUser.email = email;
                        const hashedPassword = await bcrypt.hash(req.body.password, 10);
                        newUser.username = req.body.username;
                        newUser.password = hashedPassword;
                        newUser.save(function(err) {
                            if (err) throw err;
                            console.log(newUser);
                            console.log('User Created Successfully!'.green);
                            return done(null, newUser);
                        });
                    });
                });
            }
        )
    );


function isLoggedin(req, res, next) {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}
function isLoggedOut(req, res, next) {
    if(!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard');
}


//APP PORT
const port = 3000 || process.env.PORT;


//routes
app.get('/', function(res,res){
    res.render('index');
})
app.get('/login',isLoggedOut, function(req, res){
    res.render('login')
})
app.get('/signup',isLoggedOut, function(req, res){
    res.render('signin')
})
app.get('/dataEntry',isLoggedin, function(req, res){
    res.render('dataentry')
})
app.get('/dashboard', isLoggedin,function(req,res){
    res.render('dashboard', {user: req.user.username});
})
//signup startegy route
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/dashboard',
    failureRedirect: '/signup',
    failureFlash: true
}));
//login route
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  }));


app.listen(port, function(){
    console.log("🚀 | Server Started at port "+port.toString().green);
})