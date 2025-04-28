const router = require('express').Router();
const { checkToken } = require('../../utils/middleware');
const { getProducts, getProductById, createProduct, updateProduct, deleteProductById } = require('../../controllers/products.controllers');

router.get('/', checkToken, getProducts);
router.get('/:id', checkToken, getProductById);
router.post('/', checkToken, createProduct);
router.put('/:id', checkToken, updateProduct);
router.delete('/:id', checkToken, deleteProductById);

module.exports = router;