const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const { SECRET_KEY } = require('./helpers');

const checkToken = async (req, res, next) => {
    try {
        // Verifica si existe el header de autorización
        if (!req.headers['authorization']) {
            return res.status(401).json({ message: 'No se proporcionó token' });
        }

        // Extraer el token eliminando 'Bearer '
        const token = req.headers['authorization'].split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Formato de token inválido' });
        }

        console.log('Token recibido:', token); // Debug

        // Verifica el token usando la SECRET_KEY
        const payload = jwt.verify(token, SECRET_KEY);
        console.log('Payload:', payload); // Debug

        // Busca el usuario en la base de datos
        const user = await User.findById(payload.usuario_id);
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        req.user = user;
        next();

    } catch (error) {
        console.error('Error en checkToken:', error);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

module.exports = { checkToken };