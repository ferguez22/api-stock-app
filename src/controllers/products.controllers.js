
const Product = require('../models/products.model');

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



module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProductById
};