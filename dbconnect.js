
const { Pool } = require('pg');

const config = {
  user: 'postgres',
  password: 'Jeyanth@2004',
  host: 'localhost',
  port: 5432,
  database: 'fitfuel',
};



const pool = new Pool(config);

const dbcon = async () => {
  try {
    await pool.connect();
    console.log('Connected to PostgreSQL server');
  } catch (error) {
    console.error('Error connecting to PostgreSQL server:', error);
  }
};

const dbend = async () => {
  try {
    await pool.end();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error closing connection:', error);
  }
};

module.exports = {
  dbcon,
  dbend,
  pool:pool,
};

