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




// const jwt = require('jsonwebtoken');
// const SECRET_KEY = 'xxxxxx';   

// const createToken = (user) => {
//     const data = {
//         usuario_id: user._id,
//         usuario_role: user.role
//     }
//     return jwt.sign(data, SECRET_KEY)
// }

// module.exports = {
//     createToken,
//     SECRET_KEY
// }   