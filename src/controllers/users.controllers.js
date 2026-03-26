const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { createToken } = require('../utils/helpers');

const getUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, role, is_active, last_login, created_at FROM users'
        );
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
};

const getUserById = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, email, role, is_active, last_login, created_at FROM users WHERE id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el usuario' });
    }
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const [existing] = await pool.query(
            'SELECT id FROM users WHERE email = ?', 
            [email]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, message: 'El email ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'user']
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, name, email, role: role || 'user' }
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ success: false, message: 'Error al registrar usuario' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND is_active = 1',
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email y/o contraseña incorrectos' });
        }

        const user = rows[0];
        const same = await bcrypt.compare(password, user.password);
        if (!same) {
            return res.status(401).json({ success: false, message: 'Email y/o contraseña incorrectos' });
        }

        await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        res.json({
            success: true,
            message: '🚀 Login correcto',
            token: createToken(user)
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ success: false, message: 'Error en login' });
    }
};

const updateUser = async (req, res) => {
    try {
        const { name, email, password, role, is_active } = req.body;

        let hashedPassword;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const [result] = await pool.query(
            `UPDATE users SET 
                name      = COALESCE(?, name),
                email     = COALESCE(?, email),
                password  = COALESCE(?, password),
                role      = COALESCE(?, role),
                is_active = COALESCE(?, is_active)
            WHERE id = ?`,
            [name, email, hashedPassword || null, role, is_active, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        res.json({ success: true, message: 'Usuario actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const [result] = await pool.query(
            'UPDATE users SET is_active = 0 WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({ success: true, message: 'Usuario desactivado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }
};

module.exports = {getUsers, getUserById, registerUser, loginUser, updateUser, deleteUser };