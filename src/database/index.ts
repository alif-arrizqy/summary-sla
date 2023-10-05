import mysql from 'mysql2';
import dbConfig from '../config/db.config';

export default mysql.createConnection({
    host: dbConfig.HOST,
    user: dbConfig.USERNAME,
    password: dbConfig.PASSWORD,
    database: dbConfig.DB,
})
