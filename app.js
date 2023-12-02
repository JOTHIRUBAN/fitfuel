const express = require('express');
//const passport = require('passport');
//const LocalStrategy = require('passport-local').Strategy;
//const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
//const bcrypt = require('bcrypt');
//const { Pool } = require('pg');

const app = express();

// Set up session
//app.use(session({
//  secret: 'your-secret-key',
//  resave: false,
//  saveUninitialized: true
//}));

// Initialize Passport
//app.use(passport.initialize());
//app.use(passport.session());

// Set up body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.set('view engine','ejs');

app.get("/",(req,res)=>{
    res.render("home");
})
app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/signin",(req,res)=>{
    res.render("signin");
})

app.post("/home",(req,res)=>{
    let username = "Jeyabalan";
    let height = req.body.height;
    let weight = req.body.weight;
    res.render("home",{username:username,weight:weight,height:height});
})

app.listen(3000,()=>{
    console.log("3000");
})



