const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'odaville',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Convert pool query into promise
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(results);
        });
    });
};

module.exports = {
    query
}; 