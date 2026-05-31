const jwt  = require('jsonwebtoken');
const pool = require('../config/db');

const checkToken = async (req, res, next) => {
    try {
        if (!req.headers['authorization'])
            return res.status(401).json({ message: 'No se proporcionó token' });

        const token = req.headers['authorization'].split(' ')[1];
        if (!token)
            return res.status(401).json({ message: 'Formato de token inválido' });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const [rows]  = await pool.query(
            'SELECT * FROM users WHERE id = ? AND is_active = 1',
            [payload.usuario_id]
        );

        if (rows.length === 0)
            return res.status(401).json({ message: 'Usuario no encontrado o inactivo' });

        req.user = rows[0];
        next();
    } catch {
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin')
        return res.status(403).json({ message: 'Acceso denegado: se requiere rol admin' });
    next();
};

// FIX 1: bloquea acciones admin→admin
const checkTargetNotAdmin = async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT role FROM users WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0)
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

        if (rows[0].role === 'admin' && req.user.id !== parseInt(req.params.id))
            return res.status(403).json({
                success: false,
                message: 'No puedes modificar la cuenta de otro administrador'
            });

        req.targetUser = rows[0];
        next();
    } catch {
        return res.status(500).json({ success: false, message: 'Error de autorización' });
    }
};

module.exports = { checkToken, checkAdmin, checkTargetNotAdmin };