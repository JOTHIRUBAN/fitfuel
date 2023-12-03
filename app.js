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
    user: 'postgres',
    host: 'localhost',
    database: 'fitfuel',
    password: 'Jeyanth@2004',
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


app.get("/menu",(req,res)=>{
  res.render("menu");
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
        req.session.userName = user.user_name;
        req.session.userEmail = user.email;
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
      res.status(500).json({ message: 'User already found' });
    }
  });

  app.get('/home', (req, res) => {
    res.render('home');
});
app.post("/home",async (req,res)=>{
    let height = req.body.height;
    let weight = req.body.weight;
    let name = req.session.userName;
    let diet = req.body.diets;
    let health_issues = req.body.healthIssues;
    let user_id = req.session.userId
    console.log(req.session.userId);
    const bmi_insert = "INSERT INTO user_profile(user_id,user_name,weight,height,health_issues,diet) values($1,$2,$3,$4,$5,$6)";
    try{
      await pool.query(bmi_insert,[user_id,name,weight,height,health_issues,diet]);
    }catch(error){
      res.status(500).json({ message: 'unable to insert the height and weight' });
    }
    const bmi_select = "SELECT * FROM user_profile where user_id=$1";
    try{
      const bmi_result = await pool.query(bmi_select,[user_id]);
      const bmi_user = bmi_result.rows[0]
      console.log(bmi_result.rowCount);
      if(bmi_user){
        let bmi = bmi_user.bmi;
        let status = bmi_user.status;
        let required_weight = bmi_user.required_weight;
        res.render("home",{user_id:user_id,username:name,weight:weight,height:height,bmi:bmi,status:status});

      }else{
        res.status(500).json({ message: 'couldnt get' });
      }
    }catch(error){
      res.status(500).json({ message: 'unable to insert the height and weight' });
    }

})

app.get("/manager",async (req,res)=>{
  
  res.render("manager");
})
app.get("/que",async (req,res)=>{
  const q = await pool.query('select * from "user"');

  const rows = q.rows;
  console.log(rows);
  res.render("query",{row:rows});
})
app.post("/manager",async (req,res)=>{
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM manager WHERE manager_name = $1 AND manager_password = $2', [username, password]);

    if (result.rows.length > 0) {
      // User found, set session and redirect
      req.session.userId = result.rows[0].manager_id;
      res.render("quee");
    } else {
      // Invalid credentials, redirect to login
      res.render("query");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

})


app.post('/menu', async (req, res) => {
  try {
    

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



