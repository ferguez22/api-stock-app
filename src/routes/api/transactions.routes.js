const express = require('express');
const router = express.Router();
const { createTransaction, getAllTransactions } = require('../../controllers/transactions.controllers');
const { checkToken } = require('../../utils/middleware');

// Crear transacción
router.post('/', checkToken, createTransaction);

// Obtener transacciones
router.get('/', checkToken, getAllTransactions);

module.exports = router;
