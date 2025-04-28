
const User = require('../models/users.model');
const bcrypt = require('bcryptjs');
const { createToken } = require('../utils/helpers');

// Obtener todos los usuarios
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Registro de un nuevo usuario
const registerUser = async (req, res, next) => {
    try {
        console.log('Iniciando registro de usuario');
        req.body.password = await bcrypt.hash(req.body.password, 10);
        console.log('Password hasheada');
        
        const newUser = await User.create(req.body);
        console.log('Usuario creado:', newUser);
        
        res.json(newUser);
    } catch (error) {
        console.error('Error en registro:', error);
        next(error);
    }
}

// Login de usuario
const loginUser = async (req, res, next) => {
    try {
        // Body: email, password
        const { email, password } = req.body

        // Existe el email en la BD ?
        const user = await User.findOne({ email })
        if (!user) return res.status(401), json({ Message: 'Email y/o contraseña incorrectos' })

        // Comparamos la contraseña
        const same = await bcrypt.compare(password, user.password)
        if (!same) return res.status(401).json({ Message: 'Email y/o contraseña incorrectos' })

        res.json({
            Message: '🚀 Login correcto 🚀 ',
            token: createToken(user)
        })
      
    } catch (error) {
        next(error)
    }
}

// Actualizar un usuario
const updateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, password, role },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(updatedUser);
  }
  catch (error) {
    res.status(400).json({ message: 'Error updating user' });
  }
}

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

module.exports = {
    getUsers,
  registerUser,
    loginUser,
    updateUser,
    deleteUser
};