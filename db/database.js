// import
const mysql = require("mysql2");

require('dotenv').config();

// Connect to database
const connection = mysql.createConnection({
  host: "localhost",
  user: process.env.DB_USER,
  database: 'employee_db',
  password: process.env.DB_PW,
  port: 3306
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Connected to company database");
});

module.exports = connection;