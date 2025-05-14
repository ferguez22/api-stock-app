const router = require('express').Router();
const { checkToken } = require('../../utils/middleware');
const { getProducts, getProductById, createProduct, updateProduct, deleteProductById, getProductInventoryStatus, getProductByBarcode, getAllProductsInventoryStatus } = require('../../controllers/products.controllers');

router.get('/', checkToken, getProducts);
router.get('/product-status', checkToken, getAllProductsInventoryStatus);
router.get('/product-status/:id', checkToken, getProductInventoryStatus); // Esta ruta debe ir ANTES de '/:id' ojooooo
router.get('/barcode/:code', checkToken, getProductByBarcode);
router.get('/:id', checkToken, getProductById);
router.post('/', checkToken, createProduct);
router.put('/:id', checkToken, updateProduct);
router.delete('/:id', checkToken, deleteProductById);

module.exports = router;