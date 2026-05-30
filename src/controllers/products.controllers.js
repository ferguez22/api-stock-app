const pool = require('../config/db');

// Generar código único de producto
const generateCode = async (category, brand) => {
    const catPart = (category || 'XXX').substring(0, 3).toUpperCase().padEnd(3, 'X');
    const braPart = (brand || 'XXX').substring(0, 3).toUpperCase().padEnd(3, 'X');

    for (let i = 0; i < 5; i++) {
        const randomPart = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const code = `${catPart}-${braPart}-${randomPart}`;
        const [existing] = await pool.query('SELECT id FROM products WHERE code = ?', [code]);
        if (existing.length === 0) return code;
    }
    throw new Error('No se pudo generar un código único');
};

const getProducts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `);
        res.status(200).json({ success: true, count: rows.length, data: rows });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener productos' });
    }
};

const getProductById = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name AS category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `, [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener el producto' });
    }
};

const getProductByBarcode = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.code = ?
        `, [req.params.code]);
        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al buscar por código' });
    }
};

const getAllProductsInventoryStatus = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                p.id, p.code, p.item, p.brand, p.stock AS total,
                c.name AS category,
                COALESCE(SUM(CASE WHEN t.type = 'OUT' THEN t.quantity ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN t.type = 'IN'  THEN t.quantity ELSE 0 END), 0) AS fueraAlmacen
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN transactions t ON p.id = t.product_id
            GROUP BY p.id
        `);

        const data = rows.map(r => ({
            ...r,
            fueraAlmacen: Math.max(0, r.fueraAlmacen),
            enAlmacen: Math.max(0, r.total - Math.max(0, r.fueraAlmacen))
        }));

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener estado del inventario' });
    }
};

const getProductInventoryStatus = async (req, res) => {
    try {
        const [products] = await pool.query(
            'SELECT * FROM products WHERE id = ?', 
            [req.params.id]
        );
        if (products.length === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const product = products[0];
        const [txRows] = await pool.query(
            'SELECT type, SUM(quantity) AS total FROM transactions WHERE product_id = ? GROUP BY type',
            [req.params.id]
        );

        let outQty = 0, inQty = 0;
        txRows.forEach(r => {
            if (r.type === 'OUT') outQty = r.total;
            if (r.type === 'IN')  inQty  = r.total;
        });

        const fueraAlmacen = Math.max(0, outQty - inQty);

        res.status(200).json({
            success: true,
            data: {
                product: { id: product.id, code: product.code, item: product.item },
                total: product.stock,
                enAlmacen: Math.max(0, product.stock - fueraAlmacen),
                fueraAlmacen
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener estado del producto' });
    }
};

const createProduct = async (req, res) => {
    try {
        const { category_id, brand, item, description, status, stock, min_stock, price, aisle, shelf, side } = req.body;

        if (!category_id || !item) {
            return res.status(400).json({ success: false, message: 'category_id e item son obligatorios' });
        }

        const [cats] = await pool.query('SELECT name FROM categories WHERE id = ?', [category_id]);
        if (cats.length === 0) {
            return res.status(400).json({ success: false, message: 'Categoría no encontrada' });
        }

        const code = await generateCode(cats[0].name, brand);

        const [result] = await pool.query(
            `INSERT INTO products 
                (category_id, brand, item, description, status, stock, min_stock, price, code, aisle, shelf, side)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [category_id, brand, item, description, status || 'BUENO', stock || 0, min_stock || 2, price, code, aisle, shelf, side]
        );

        const [newProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
        res.status(201).json({ success: true, data: newProduct[0] });

    } catch (error) {
        console.error('Error en createProduct:', error);
        res.status(500).json({ success: false, message: 'Error al crear producto' });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { category_id, brand, item, description, status, stock, min_stock, price, aisle, shelf, side } = req.body;

        const [result] = await pool.query(
            `UPDATE products SET
                category_id = COALESCE(?, category_id),
                brand       = COALESCE(?, brand),
                item        = COALESCE(?, item),
                description = COALESCE(?, description),
                status      = COALESCE(?, status),
                stock       = COALESCE(?, stock),
                min_stock   = COALESCE(?, min_stock),
                price       = COALESCE(?, price),
                aisle       = COALESCE(?, aisle),
                shelf       = COALESCE(?, shelf),
                side        = COALESCE(?, side)
            WHERE id = ?`,
            [category_id, brand, item, description, status, stock, min_stock, price, aisle, shelf, side, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }

        const [updated] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        res.status(200).json({ success: true, data: updated[0] });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar producto' });
    }
};

const deleteProductById = async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM products WHERE id = ?', 
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Producto no encontrado' });
        }
        res.status(200).json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar producto' });
    }
};

module.exports = {
    getProducts, getProductById, getProductByBarcode,
    getAllProductsInventoryStatus, getProductInventoryStatus,
    createProduct, updateProduct, deleteProductById
};