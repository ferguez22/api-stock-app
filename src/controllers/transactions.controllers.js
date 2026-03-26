const pool = require('../config/db');

const createTransaction = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { productId, quantity, type, notes } = req.body;
        const userId = req.user.id;

        await connection.beginTransaction();

        const [products] = await connection.query(
            'SELECT * FROM products WHERE id = ? FOR UPDATE',
            [productId]
        );

        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const product = products[0];

        if (type === 'OUT' && product.stock < quantity) {
            await connection.rollback();
            return res.status(400).json({ success: false, message: 'Stock insuficiente' });
        }

        const newStock = type === 'OUT' ? product.stock - quantity : product.stock + quantity;

        await connection.query('UPDATE products SET stock = ? WHERE id = ?', [newStock, productId]);
        await connection.query(
            'INSERT INTO transactions (product_id, user_id, type, quantity, notes) VALUES (?, ?, ?, ?, ?)',
            [productId, userId, type, quantity, notes || null]
        );

        await connection.commit();
        res.status(201).json({ success: true, message: 'Transacción registrada' });

    } catch (error) {
        await connection.rollback();
        res.status(500).json({ success: false, message: 'Error al procesar la transacción' });
    } finally {
        connection.release();
    }
};

const getAllTransactions = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                t.*,
                p.item AS product_item, p.code AS product_code,
                u.name AS user_name, u.email AS user_email
            FROM transactions t
            LEFT JOIN products p ON t.product_id = p.id
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
        `);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener transacciones' });
    }
};

const getUserOutProducts = async (req, res) => {
    try {
        const { userId } = req.params;

        const [rows] = await pool.query(`
            SELECT 
                p.id, p.code, p.item, p.brand, p.stock,
                SUM(CASE WHEN t.type = 'OUT' THEN t.quantity ELSE 0 END) -
                SUM(CASE WHEN t.type = 'IN'  THEN t.quantity ELSE 0 END) AS quantityOut,
                MAX(CASE WHEN t.type = 'OUT' THEN t.created_at END) AS lastExitDate
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            WHERE t.user_id = ?
            GROUP BY p.id
            HAVING quantityOut > 0
        `, [userId]);

        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener productos del usuario' });
    }
};

const getOthersOutProducts = async (req, res) => {
    try {
        const currentUserId = req.user.id;

        const [rows] = await pool.query(`
            SELECT 
                p.id, p.code, p.item, p.brand,
                u.id AS user_id, u.name AS user_name,
                SUM(CASE WHEN t.type = 'OUT' THEN t.quantity ELSE 0 END) -
                SUM(CASE WHEN t.type = 'IN'  THEN t.quantity ELSE 0 END) AS quantityOut,
                MAX(CASE WHEN t.type = 'OUT' THEN t.created_at END) AS lastExitDate
            FROM transactions t
            JOIN products p ON t.product_id = p.id
            JOIN users u ON t.user_id = u.id
            WHERE t.user_id != ?
            GROUP BY p.id, u.id
            HAVING quantityOut > 0
        `, [currentUserId]);

        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener productos de otros usuarios' });
    }
};

module.exports = { createTransaction, getAllTransactions, getUserOutProducts, getOthersOutProducts };