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

// Modificación para getUserOutProducts en tu API
const getUserOutProducts = async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el ID del usuario'
        });
      }
      
      // Obtener todas las transacciones para este usuario
      const transactions = await Transaction.find({ user: userId })
        .populate('product', 'code type item description stock')
        .sort({ createdAt: -1 });
      
      // Agrupar por producto y calcular cantidades netas
      const productMap = {};
      
      transactions.forEach(tx => {
        const productId = tx.product._id.toString();
        
        if (!productMap[productId]) {
          productMap[productId] = {
            product: tx.product,
            quantityOut: 0,
            lastExitDate: null  // Nueva propiedad para la fecha de salida
          };
        }
        
        if (tx.type === 'OUT') {
          productMap[productId].quantityOut += tx.quantity;
          // Guardar la fecha más reciente de salida
          if (!productMap[productId].lastExitDate || new Date(tx.createdAt) > new Date(productMap[productId].lastExitDate)) {
            productMap[productId].lastExitDate = tx.createdAt;
          }
        } else if (tx.type === 'IN') {
          productMap[productId].quantityOut -= tx.quantity;
        }
        
        // Evitar valores negativos
        productMap[productId].quantityOut = Math.max(0, productMap[productId].quantityOut);
      });
      
      // Solo productos que están fuera del almacén
      const productsOut = Object.values(productMap)
        .filter(item => item.quantityOut > 0);
      
      res.status(200).json({
        success: true,
        count: productsOut.length,
        data: productsOut
      });
      
    } catch (error) {
      console.error('Error en getUserOutProducts:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos por usuario',
        error: error.message
      });
    }
  };

module.exports = {
    createTransaction,
    getAllTransactions,
    getTransactionsByProduct,
    getUserOutProducts
};
