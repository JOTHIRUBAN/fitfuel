const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();

// Set up session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Set up body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Dummy user data (replace with database queries)
const users = [
  { id: 1, email: 'user@example.com', password: '$2b$10$kyZiVjC2I9k2Y41KGp9TceMkXcQ1fhoSwfd1yE5BdE/8ZzW9yPl1W' } // hashed password: 'password'
];

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/login');
}

// Routes

// Login page
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Login route
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Dummy authentication (replace with database queries)
  const user = users.find(u => u.email === email);
  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.userId = user.id;
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Dashboard route (protected)
app.get('/dashboard', isAuthenticated, (req, res) => {
  res.send(`Welcome, User ID ${req.session.userId}!`);
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');

const app = express();

// Set up body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// PostgreSQL configuration
const pool = new Pool({
  user: 'your-postgres-username',
  host: 'localhost',
  database: 'your-database',
  password: 'your-postgres-password',
  port: 5432,
});

// Route to handle POST request for user login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (user) {
      // Compare the provided password with the stored hashed password
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (passwordMatch) {
        // Passwords match, user is authenticated
        return res.status(200).json({ message: 'Login successful', user });
      } else {
        // Incorrect password
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

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
