const http = require('http');
const app = require('./src/app');
require('dotenv').config();

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT} || ${new Date().toLocaleString()}`);
});

server.on('error', (error) => {
    console.log('Server error:', error);
});

app.get('/', (req, res) => {
    res.send('✅ API Inventario funcionando correctamente');
});