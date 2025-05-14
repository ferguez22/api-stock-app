const express = require('express');
const router = express.Router();
const { createTransaction, getAllTransactions, getUserOutProducts, getOthersOutProducts } = require('../../controllers/transactions.controllers');
const { checkToken } = require('../../utils/middleware');

// Crear transacción
router.post('/', checkToken, createTransaction);

// Obtener transacciones
router.get('/', checkToken, getAllTransactions);

// Obtener productos fuera del almacén para un usuario
router.get('/user/:userId/out', checkToken, getUserOutProducts);
router.get('/others/out', checkToken, getOthersOutProducts);

module.exports = router;
