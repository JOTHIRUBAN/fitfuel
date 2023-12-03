const express = require('express');
//const passport = require('passport');
//const LocalStrategy = require('passport-local').Strategy;
//const session = require('express-session');
const bodyParser = require('body-parser');
const ejs = require('ejs');
//const bcrypt = require('bcrypt');
//const { Pool } = require('pg');

const { dbcon, dbend,pool } = require('./dbconnect');

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

app.get("/menu",(req,res)=>{
  res.render("menu");
})

app.post("/home",(req,res)=>{
    let username = "Jeyabalan";
    let height = req.body.height;
    let weight = req.body.weight;
    res.render("home",{username:username,weight:weight,height:height});
})

app.post('/menu', async (req, res) => {
    try {
      await dbcon(); // Connect to the database
  
      const { regex/* ,food_type  */} = req.body;
      const queryString = 'SELECT food_id,food_name, food_image, food_type, food_tag, description, calories, price FROM food WHERE food_name LIKE $1';
      const queryValues = [`%${regex}%`/* ,food_type */];
  
      const result = await pool.query(queryString, queryValues);
      console.log(result.rows);
  
      // Render the 'menu' template with the query result
     res.render('./menu', { result: result.rows }); 
    } catch (error) {
      console.error('Error executing query:', error);
      // Handle the error
      res.status(500).json({ error: 'Internal Server Error' });
    } 
  });




app.listen(3000,()=>{
    console.log("3000");
})



