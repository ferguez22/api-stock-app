const router = require('express').Router();
const { checkToken, checkAdmin } = require('../../utils/middleware');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../../controllers/categories.controllers');

router.get('/',       checkToken, getCategories);
router.post('/',      checkToken, checkAdmin, createCategory);
router.put('/:id',    checkToken, checkAdmin, updateCategory);
router.delete('/:id', checkToken, checkAdmin, deleteCategory);

module.exports = router;