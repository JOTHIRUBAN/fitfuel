const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { Pool } = require('pg');
const flash = require('express-flash');
const ejs = require('ejs');
const app = express();
const path = require('path');

// Set up session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());


// Set up body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.set('view engine','ejs');

//postgresql configuration
const pool = new Pool({
    user: 'Aravind',
    host: 'financetrackergda.postgres.database.azure.com',
    database: 'Fitfuel',
    password: 'Arvi@194',
    port: 5432,
    ssl:true
  });

 /*  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'fitfuel',
    password: 'Jeyanth@2004',
    port: 5432,
  });
 */

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/img/');
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  });
  
  // Initialize Multer
  const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
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
app.get("/home",(req,res)=>{
    res.render("home");
})


app.get("/menu",(req,res)=>{
  res.render("menu");
  console.log(req.session.userId);
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
   
    try{
      const bmi_insert = `
      INSERT INTO user_profile(user_id, user_name, weight, height, health_issues, diet)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (user_id) DO UPDATE
      SET user_name = $2, weight = $3, height = $4, health_issues = $5, diet = $6 returning *;
    `;
      await pool.query(bmi_insert,[user_id,name,weight,height,health_issues,diet]);
    }catch(error){
      res.status(500).json({ message: 'unable to insert the weigt and weight' });
    }
    try{
      const bmi_select = "SELECT * FROM user_profile where user_id=$1";
      const bmi_result = await pool.query(bmi_select,[user_id]);
      const bmi_user = bmi_result.rows[0]
      console.log(bmi_result.rowCount);
      if(bmi_user){
        let bmi = bmi_user.bmi;
        let status =  Math.round(bmi_user.status);
        req.session.Status =  bmi_user.status;
        let required_weight = bmi_user.required_weight;
        let message;
        if(status=='Normal'){
            message = "You are fit add fuel to stay fit";
        }
        else if(status=='Overweight'){
          message=`You need to lose ${Math.round(required_weight)} Kgs`;
        }else {
          message=`You need to gain ${Math.round(required_weight)} Kgs`;
        }
        res.render("home",{user_id:user_id,username:name,message:message,weight:weight,height:height,bmi:bmi,status:status});

      }else{
        res.status(500).json({ message: 'couldnt get' });
      }
    }catch(error){
      res.status(500).json({ message: 'unable to insert the height and weight' });
    }

})




app.post('/menu', async (req, res) => {
  try {
    

    const { regex,food_type } = req.body;
    req.session.regex = regex;
    const queryString = 'SELECT food_id,food_name, food_image, food_type, food_tag, description, calories, price FROM food WHERE keyword LIKE $1 and food_tag=$2';
    const queryValues = [`%${regex}%`,req.session.Status];

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

app.post('/menu1', async (req, res) => {
  try {
      const { food_id } = req.body;
      const queryString = `
          INSERT INTO order_table (user_id, food_ids, order_time)
          VALUES ($1, ARRAY[$2::integer], NOW())
          ON CONFLICT (user_id)
          DO UPDATE
          SET food_ids = array_append(order_table.food_ids, $2::integer), order_time = NOW();
      `;
      const queryValues = [req.session.userId, food_id];

      await pool.query(queryString, queryValues);

      // Fetch the updated menu data
      
      const updatedResult = await pool.query('SELECT food_id, food_name, food_image, food_type, food_tag, description, calories, price FROM food WHERE food_tag=$1 and keyword like $2', [req.session.Status,`%${req.session.regex}%`]);

      res.render('./menu', { result: updatedResult.rows });
  } catch (error) {
      console.error('Error executing query:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.get("/manager",async (req,res)=>{
  
  res.render("manager_login");
})
app.post("/query",async (req,res)=>{
  const q = await pool.query(req.body.query);

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
      req.session.manager_id = result.rows[0].manager_id;
      req.session.manager_name = result.rows[0].manager_name;
      res.render("manager_page",{manager:req.session.manager_name});
    } else {
      // Invalid credentials, redirect to login
      res.render("query");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

   
})


app.get("/supplier_login",(req,res)=>{
  res.render("supplier_login");
})

app.post("/supplier",async (req,res)=>{
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM supplier WHERE supplier_name = $1 AND supplier_password = $2', [username, password]);

    if (result.rows.length > 0) {
      // User found, set session and redirect
      req.session.supplier_id = result.rows[0].supplier_id;
      req.session.supplier_name = result.rows[0].supplier_name;
      res.render("supplier_form");
    } else {
      // Invalid credentials, redirect to login
      res.status(500).send('supplier not found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
})



app.post('/supplier_process', upload.single('foodImage'), async (req, res) => {
  try {
    console.log(req.file);
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }

    const { foodId, foodName, description, price, foodType, calories, foodTag, keyword } = req.body;
    const imagePath = req.file.path;

    // Insert data into PostgreSQL database
    const query = `
      INSERT INTO manager_food (food_id, food_name, food_image, description, price, food_type, calories, food_tag, keyword,supplier_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)
    `;

    const values = [foodId, foodName, imagePath.slice(7), description, parseFloat(price), foodType, calories, foodTag, keyword,req.session.supplier_id];
    await pool.query(query, values);

    
    res.render("supplier_form");
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// ... (Your existing server setup)

app.get('/food_log', async (req, res) => {
  try {
    // Fetch food log data from the database
    const query = `
    SELECT s.supplier_name,f.food_id, f.food_name, f.food_image, f.description, f.price, f.food_type, f.calories
    FROM manager_food f
    JOIN supplier s ON f.supplier_id = s.supplier_id
    `;
    const result = await pool.query(query);
    console.log(result.rowCount);
    // Render the HTML page with the fetched data
    res.render('food_log', { foodLogData: result.rows, manager: req.session.manager_name ,rowCount:result.rowCount});
  } catch (error) {
    console.error('Error fetching food log:', error);
    res.status(500).send('Internal Server Error');
  }
});

// ... (Your existing server code)
app.post("/submit_food",async(req,res)=>{
  const food_ids = req.body.selectedFoodIds.split(',');
  console.log(typeof(food_ids));
    try {
      for (const foodId of food_ids) {
        const insertOrUpdateQuery = `
          INSERT INTO food (food_id, food_name, food_image, description, price, food_type, calories, food_tag, keyword)
          SELECT
            manager_food.food_id,
            manager_food.food_name,
            manager_food.food_image,
            manager_food.description,
            manager_food.price,
            manager_food.food_type,
            manager_food.calories,
            manager_food.food_tag,
            manager_food.keyword
          FROM manager_food
          WHERE manager_food.food_id = $1
          ON CONFLICT (food_id) DO UPDATE
          SET
            food_name = EXCLUDED.food_name,
            food_image = EXCLUDED.food_image,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            food_type = EXCLUDED.food_type,
            calories = EXCLUDED.calories,
            food_tag = EXCLUDED.food_tag,
            keyword = EXCLUDED.keyword
        `;
  
        await pool.query(insertOrUpdateQuery, [foodId]);
      }
      await pool.query('DELETE from manager_food');
      res.redirect("/food_log");
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
    }
  
})
app.get("/add",(req,res)=>{
  res.render("add");
})

app.post("/review", async(req,res)=>{
  
  try {
    
    const {food_name,food_type,food_star,review}=req.body;
    const queryString = `
      INSERT INTO review (user_id, food_name, food_type,food_star,review,time)
      VALUES ($1, $2, $3, $4, $5,now())
      ON CONFLICT (user_id)
      DO UPDATE
      SET food_name= $2,food_type=$3,food_star=$4,review=$5,time=now();
    `;
    const queryValues = [req.session.userId, food_name ,food_type,food_star,review];

    const result = await pool.query(queryString, queryValues);
    console.log("successfully updated");

    // Render the 'menu' template with the query result
   res.render('./menu'); 
  } catch (error) {
    console.error('Error executing query:', error);
    // Handle the error
    res.status(500).json({ error: 'Internal Server Error' });
  } 


})

let selectedFoodIds = [];
app.get("/order_food",async (req,res)=>{
  
  const select_query = `SELECT food_ids from order_table where user_id = $1`;
  try{
    const result = await pool.query(select_query,[req.session.userId]);
    const foodIdsArray = result.rows.map(row => row.food_ids);
    selectedFoodIds = foodIdsArray.flat();
    console.log(selectedFoodIds);
    res.render("order_food");

  }catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

let foodArray = [];

app.get('/getFoodDetails', async (req, res) => {
  try {
    for (const food_id of selectedFoodIds) {
      const result = await pool.query(
        `SELECT food_id, food_name, price FROM food WHERE food_id = $1`,
        [food_id]
      );
      foodArray.push(result.rows[0]);
    }

    res.json(foodArray);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
// Handle removing a food item
app.post('/removeFood', (req, res) => {
  const { foodId } = req.body;

  // Remove the selected food ID from the array
  selectedFoodIds = selectedFoodIds.filter((food_id) => food_id !== foodId);

  res.json({ success: true });
});

// Calculate total price based on selected food items
app.get('/getTotalPrice', async (req, res) => {
  try {
    let total=0;
    for (const food_id of selectedFoodIds) {
      const result = await pool.query(
        `SELECT price FROM food WHERE food_id = $1`,
        [food_id]
      );
      
      total+=Number(result.rows[0].price);
    }console.log(total)
    res.json({ total: total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/placeOrder', async (req, res) => {
  const { foodIds } = req.body;

  try {
      // Insert the selected food IDs into the ordering table
      console.log(foodIds);
      const insertQuery = 'INSERT INTO orders (food_ids,user_id) VALUES ($1,$2)';
          await pool.query(insertQuery, [foodIds,req.session.userId]);
    const delete_query = `DELETE FROM order_table WHERE user_id=$1`;
    await pool.query(delete_query, [req.session.userId]);
      res.json({ success: true, message: 'Order placed successfully' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});



app.listen(process.env.PORT||3000,()=>{
    console.log("3000");
})


//supplier_name,food name,food image, description, price, food_type,calories
//magnager food accept panna food goes to foos table 
//manager views the reviews
//order link click panna order table la pogum 