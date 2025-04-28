const http = require('http');
const app = require('./src/app');
const mongoose = require('mongoose');

// Config .env
require('dotenv').config();

// Server creation
const server = http.createServer(app);
const PORT = process.env.PORT || 4200;

// Conexión a MongoDB y inicio del servidor
const startServer = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB conectado exitosamente || ' + mongoose.connection.host);
        
        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT} || ${new Date().toLocaleString()}`);
        });
    } catch (error) {
        console.error('Error al conectar MongoDB:', error.message);
        process.exit(1);
    }
};

startServer();

server.on('error', (error) => {
    console.log('Server error:', error);
});