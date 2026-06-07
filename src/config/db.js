const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PORT || 3306,
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ MariaDB conectado exitosamente');
        connection.release();
    } catch (error) {
        console.error('❌ Error al conectar MariaDB:', error.message);
        process.exit(1);
    }
};

testConnection();

module.exports = pool;


// const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     console.log('MongoDB conectado exitosamente || ' + mongoose.connection.host);   
//   } catch (error) {
//     console.error('Error al conectar MongoDB:', error.message);
//     process.exit(1);
//   }
// };

// connectDB();

// module.exports = connectDB;