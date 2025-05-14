
const Product = require('../models/products.model');
const Transaction = require('../models/transactions.model');

// Obtener todos los productos
const getProducts = async (req, res) => {
    try {
        console.log('Intentando obtener productos...');
        const products = await Product.find().sort({ createdAt: -1 });
        console.log('Productos encontrados:', products.length);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error('Error en getProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        res.status(200).json({
            success: true,
            data: product
        });
    }
    catch (error) {
        console.error('Error en getProductById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
}

// Obtener el estado del inventario de todos los productos
const getAllProductsInventoryStatus = async (req, res) => {
  try {
    const products = await Product.find();
    const transactions = await Transaction.find();

    const productStatusMap = {};

    // Inicializar cada producto
    products.forEach(product => {
      productStatusMap[product._id] = {
        id: product._id,
        code: product.code,
        item: product.item,
        total: product.stock,
        fueraAlmacen: 0,
        enAlmacen: product.stock
      };
    });

    // Procesar las transacciones
    transactions.forEach(tx => {
      const current = productStatusMap[tx.product];
      if (!current) return;

      if (tx.type === 'OUT') {
        current.fueraAlmacen += tx.quantity;
        current.enAlmacen -= tx.quantity;
      } else if (tx.type === 'IN') {
        current.fueraAlmacen -= tx.quantity;
        current.enAlmacen += tx.quantity;
      }

      // Limitar valores negativos
      current.fueraAlmacen = Math.max(0, current.fueraAlmacen);
      current.enAlmacen = Math.max(0, current.enAlmacen);
    });

    res.status(200).json({
      success: true,
      data: Object.values(productStatusMap)
    });

  } catch (error) {
    console.error('Error al calcular inventario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estado del inventario',
      error: error.message
    });
  }
};

// En transactions.controllers.js
const getProductInventoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener el producto
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    // Calcular productos fuera mediante transacciones
    const transactions = await Transaction.find({ product: id });
    
    let outQuantity = 0;
    transactions.forEach(trans => {
      if (trans.type === 'OUT') outQuantity += trans.quantity;
      else if (trans.type === 'IN') outQuantity -= trans.quantity;
    });
    
    // Si hay valores negativos (más entradas que salidas), corregir a 0
    outQuantity = Math.max(0, outQuantity);
    
    res.status(200).json({
      success: true,
      data: {
        product: {
          id: product._id,
          code: product.code,
          type: product.type,
          item: product.item
        },
        total: product.stock,
        inAlmacen: Math.max(product.stock - outQuantity, 0),
        fueraAlmacen: outQuantity
      }
    });
    
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error obteniendo estado del inventario',
      error: error.message 
    });
  }
};

// Crear un nuevo producto
const createProduct = async (req, res) => {
    try {
        const { type, item, description, stock } = req.body;
        
        if (!type) {
            return res.status(400).json({
                success: false,
                message: 'Product type is required'
            });
        }

        const product = new Product({
            type,
            item,
            description,
            stock
        });

        const savedProduct = await product.save();
        
        res.status(201).json({
            success: true,
            data: savedProduct
        });
    } catch (error) {
        console.error('Error en createProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// Actualizar un producto por ID
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, item, description, stock } = req.body;

        // Primero verificamos si el producto existe
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Actualizamos solo los campos permitidos
        // Nota: el código no se puede actualizar por ser inmutable
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                type,
                item,
                description,
                stock
            },
            {
                new: true, // Retorna el documento actualizado
                runValidators: true // Ejecuta las validaciones del esquema
            }
        );

        res.status(200).json({
            success: true,
            data: updatedProduct
        });
    } catch (error) {
        console.error('Error en updateProduct:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// Eliminar un producto por ID
const deleteProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }
        res.status(200).json({
            success: true,
            data: deletedProduct
        });
    } catch (error) {
        console.error('Error en deleteProductById:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};

// Obtener un producto por código
const getProductByBarcode = async (req, res) => {
    try {
      const { code } = req.params;
      
      const product = await Product.findOne({ code });
      
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró ningún producto con este código'
        });
      }
      
      res.status(200).json({
        success: true,
        data: product
      });
      
    } catch (error) {
      console.error('Error en getProductByBarcode:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar el producto por código',
        error: error.message
      });
    }
};
  
module.exports = {
    getProducts,
    getProductById,
    getProductInventoryStatus,
    getProductByBarcode,
    createProduct,
    updateProduct,
    deleteProductById,
    getAllProductsInventoryStatus
};