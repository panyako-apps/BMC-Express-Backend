import mysql from 'mysql2';

export const db = mysql.createConnection({
    host: 'localhost',
    user: 'panyako',
    password: 'insync88PX',
    database: 'bmc',
});