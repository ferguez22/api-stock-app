const jwt = require('jsonwebtoken');
const SECRET_KEY = 'LuiferSuperPassword';   

const createToken = (user) => {
    const data = {
        usuario_id: user._id,
        usuario_role: user.role
    }
    return jwt.sign(data, SECRET_KEY)
}

module.exports = {
    createToken,
    SECRET_KEY
}   