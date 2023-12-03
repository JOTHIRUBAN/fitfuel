-- Create the 'food' table
CREATE TABLE food (
    food_id SERIAL PRIMARY KEY,
    food_name VARCHAR(255),
    food_image TEXT,
    description TEXT,
    price DECIMAL(10, 2),
   	food_type VARCHAR(50)
);

alter table  food add column food int;
alter table  food add column food_tag varchar;

/* app.post('/menu', async (req, res) => {
  try {
    await dbcon(); // Connect to the database

    const { regex } = req.body;
    const queryString = 'SELECT food_name, food_image, food_type, food_status, description, food_calories, food_price FROM food WHERE food_name LIKE $1';
    const queryValues = [`%${regex}%`];

    const result = await pool.query(queryString, queryValues);

    // Render the 'menu' template with the query result
    res.render('menu', { result: result.rows });
  } catch (error) {
    console.error('Error executing query:', error);
    // Handle the error
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    // Close the database connection
    await dbend();
  }
}); */


-- Create the 'supplier' table
CREATE TABLE supplier (
    supplier_id SERIAL PRIMARY KEY,
    supplier_name VARCHAR(255)
);
	
create table supplied_items(
	supplier_id SERIAL references supplier(supplier_id),
    food_id SERIAL references food(food_id)
);

-- Create the 'review' table
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    food_id INTEGER REFERENCES food(food_id),
    food_star INTEGER
);

-- Create the 'order' table
CREATE TABLE order_table (
    order_id SERIAL PRIMARY KEY,
    order_time TIMESTAMP,
    food_ids INTEGER[],
    order_status VARCHAR(50)
);

-- Create the 'customer_service' table
CREATE TABLE customer_service (
    cs_id SERIAL PRIMARY KEY,
    cs_details VARCHAR(255),
    cs_time TIMESTAMP,
    user_id INTEGER REFERENCES "user"(user_id)
);

-- Create the 'manager' table
CREATE TABLE manager (
    manager_id SERIAL PRIMARY KEY,
    manager_name VARCHAR(255),
    manager_password VARCHAR(255)
);


