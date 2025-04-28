const Product = require('../models/products.model');
const Transaction = require('../models/transactions.model');

// Crear transacción (sacar o devolver producto)
const createTransaction = async (req, res) => {
    try {
        const { productId, quantity, type } = req.body;
        const userId = req.user.id; // Viene del middleware de autenticación

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        if (type === 'OUT') {
            if (product.stock < quantity) {
                return res.status(400).json({ message: 'No hay suficiente stock para sacar' });
            }
            product.stock -= quantity;
        } else if (type === 'IN') {
            product.stock += quantity;
        } else {
            return res.status(400).json({ message: 'Tipo de transacción inválido (debe ser IN o OUT)' });
        }

        // Guardar la transacción
        const transaction = new Transaction({
            product: productId,
            user: userId,
            type,
            quantity
        });
        await transaction.save();

        // Guardar cambios en el producto
        await product.save();

        res.status(201).json({ message: 'Transacción registrada', transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar la transacción' });
    }
};

// Obtener todas las transacciones
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .populate('product', 'item type') // Trae solo nombre y tipo
            .populate('user', 'name email')    // Trae nombre y email del usuario
            .sort({ createdAt: -1 });           // Ordenadas de la más reciente a la más vieja

        res.status(200).json({ message: 'Transacciones obtenidas exitosamente', transactions });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener transacciones' });
    }
};

// Obtener transacciones de un solo producto
const getTransactionsByProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const transactions = await Transaction.find({ product: productId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener transacciones del producto' });
    }
};

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionsByProduct
};
