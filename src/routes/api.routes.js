const router = require('express').Router();

router.use('/users',        require('./api/users.routes'));
router.use('/products',     require('./api/products.routes'));
router.use('/transactions', require('./api/transactions.routes'));
router.use('/categories',   require('./api/categories.routes'));

module.exports = router;