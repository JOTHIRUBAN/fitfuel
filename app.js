const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const flash = require('express-flash');
const ejs = require('ejs');
const app = express();

// Set up session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());


// Set up body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.set('view engine','ejs');

//postgresql configuration
const pool = new Pool({
    user: 'jothiruban',
    host: '10.13.26.67',
    database: 'fitfuel',
    password: 'postgres',
    port: 5432,
  });

 

app.get("/",(req,res)=>{
    res.render("home");
})
app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/signin",(req,res)=>{
    res.render("signin");
})
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const result = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user) {
      
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
   
        console.log(user);
        req.session.userId = user.user_id;
        res.redirect('home');
      
      } else {
     
        return res.status(401).json({ message: 'Incorrect password' });
      }
    } else {
      // User not found
      return res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/home', (req, res) => {
      res.send(`Welcome, ${req.session.userId}!`);
    
  });
  
  function isAuthenticated(req, res, next) {
    if (req.session.userId) {
      return next();
    }
    res.redirect('/login');
  }
app.post('/signin', async (req, res) => {
    const { name, mobile, email,password } = req.body;
  
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);
  
    try {
      await pool.query('INSERT INTO "user" (user_name,email,mobile, password) VALUES ($1, $2,$3,$4)', [name, email, mobile, hashedPassword]);
      res.redirect('/login'); // Redirect to login page after successful registration
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).send('Internal Server Error');
    }
  });


app.post("/home",(req,res)=>{
    let username = "Jeyabalan";
    let height = req.body.height;
    let weight = req.body.weight;
    res.render("home",{username:username,weight:weight,height:height});
})

app.listen(3000,()=>{
    console.log("3000");
})



