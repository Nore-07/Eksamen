const mysql = require('mysql2');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'admin',
  password: 'admin',
  database: 'forum_db'
});

module.exports = pool;