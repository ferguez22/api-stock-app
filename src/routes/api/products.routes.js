// src/routes/api/products.routes.js
const router = require('express').Router();
const { checkToken, checkAdmin } = require('../../utils/middleware');
const {
    getProducts, getProductById, getProductByBarcode,
    getAllProductsInventoryStatus, getProductInventoryStatus,
    createProduct, updateProduct, deleteProductById
} = require('../../controllers/products.controllers');

router.get('/',                   checkToken, getProducts);
router.get('/product-status',     checkToken, getAllProductsInventoryStatus);
router.get('/product-status/:id', checkToken, getProductInventoryStatus);
router.get('/barcode/:code',      checkToken, getProductByBarcode);
router.get('/:id',                checkToken, getProductById);

router.post('/',      checkToken, checkAdmin, createProduct);
router.put('/:id',    checkToken, checkAdmin, updateProduct);
router.delete('/:id', checkToken, checkAdmin, deleteProductById);

module.exports = router;