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
    email: String,
    password: String
})
//models
const User = mongoose.model('User', userSchema);



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

passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
      },function (email, password, done) {
      User.findOne({ email: email }, function (err, user) {
          if (err) return done(err);
          if (!user) return done(null, console.log('dog'), false, { message: 'Incorrect email.' });
          bcrypt.compare(password, user.password, function (err, res) {
              if (err) return done(err);
              if (res === false) return done(null, false, { message: 'Incorrect password.' });
              
              return done(null, user);
          });
      });
  }));  
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
    const response ={
        error: req.query.err
    }
    res.render('login', response);
})
app.get('/signup', function(req, res){
    res.render('signin')
})
app.get('/dashboard', isLoggedin,function(req,res){
    res.render('dashboard');
})
// post routes

app.post('/signup', async function(req, res){
        const existingUser = await User.findOne({email: req.body.email});
        if(existingUser) {
            return res.send('User already exists');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        user.save();
        res.redirect('/login');
})
//login route
app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login?err=true'
  }));
// app.post('/login', function(req, res, next){
//     passport.authenticate('local', function(err, user, info){
//         if(err) {
//             return next(err);
//         }
//         if(!user) {
//             console.log("123");
//             return res.redirect('/login?error=true');
//         }
//         req.logIn(user, function(err){
//             if(err) {
//                 return next(err);
//             }
//             return res.redirect('/dashboard');
//         });
//     })(req, res, next);
// })



app.listen(port, function(){
    console.log("🚀 | Server Started at port "+port.toString().green);
})