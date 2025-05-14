const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'SoundstackDB'
});

// set password: ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';
// start by: mysql -u root -p   password is 'root'

module.exports = pool.promise();
