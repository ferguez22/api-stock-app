const router = require('express').Router();
const { getUsers, getUserById, registerUser, loginUser, updateUser, deleteUser } = require('../../controllers/users.controllers');
const { checkToken, checkAdmin } = require('../../utils/middleware');

router.get('/',     checkToken, checkAdmin, getUsers);     // solo admin
router.get('/:id',  checkToken, getUserById);

router.post('/register', registerUser);
router.post('/login',    loginUser);

router.put('/:id',    checkToken, updateUser);
router.delete('/:id', checkToken, checkAdmin, deleteUser); // solo admin

module.exports = router;