//  URL BASE /api

const router = require('express').Router();

router.use('/users', require('./api/users.routes'))
router.use('/products', require('./api/products.routes'));
router.use('/transactions', require('./api/transactions.routes'))

module.exports = router;