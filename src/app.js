const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200', // Para desarrollo, ajustar en producción
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/api', require('./routes/api.routes'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

module.exports = app;