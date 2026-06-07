const jwt = require('jsonwebtoken');

const createToken = (user) => {
    const data = {
        usuario_id: user.id,
        usuario_role: user.role
    };
    return jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });
};

module.exports = { createToken };