const pool = require('../config/db');

const getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.*, parent.name AS parent_name
            FROM categories c
            LEFT JOIN categories parent ON c.parent_id = parent.id
            ORDER BY c.parent_id, c.name
        `);
        res.status(200).json({ success: true, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener categorías' });
    }
};

const createCategory = async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
        }
        const [result] = await pool.query(
            'INSERT INTO categories (name, parent_id) VALUES (?, ?)',
            [name, parent_id || null]
        );
        res.status(201).json({ success: true, data: { id: result.insertId, name, parent_id } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ success: false, message: 'La categoría ya existe' });
        }
        res.status(500).json({ success: false, message: 'Error al crear categoría' });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { name, parent_id } = req.body;
        const [result] = await pool.query(
            'UPDATE categories SET name = ?, parent_id = ? WHERE id = ?',
            [name, parent_id || null, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        res.json({ success: true, message: 'Categoría actualizada' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar categoría' });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM categories WHERE id = ?',
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Categoría no encontrada' });
        }
        res.json({ success: true, message: 'Categoría eliminada' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ success: false, message: 'No se puede eliminar: tiene productos asociados' });
        }
        res.status(500).json({ success: false, message: 'Error al eliminar categoría' });
    }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };