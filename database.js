var mysql = require('mysql2');
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Siyadho@123',
    database: 'blood_bank'
});
conn.connect((err) => {
    if (err) {
        console.log('Error connecting to Db');
        console.log(err);
        return;
    }
    console.log('Connection established');
});
module.exports = conn;