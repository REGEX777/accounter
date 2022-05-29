const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const colors = require('colors');

//intialize express
const app = express();
//intialize body-parser
app.use(bodyParser.urlencoded({extended: true}));
//set view engine
app.set('view engine', 'ejs');
//set public folder
app.use(express.static('public'));
//APP PORT
const port = 3000 || process.env.PORT;

//mongoose connection
mongoose.connect('mongodb://localhost:27017/accounterDB', {useNewUrlParser: true},function(err){
    if(err){
        console.log("❗ | "+err.red);
    }else{
        console.log("⚙ | Connected to Database Succesfully.".green);
    }
});


//routes
app.get('/', function(res,res){
    res.render('index');
})
app.get('/login', function(req, res){
    res.render('login')
})


app.listen(port, function(){
    console.log("🚀 | Server Started at port "+port.toString().green);
})