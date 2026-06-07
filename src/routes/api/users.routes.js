const router = require('express').Router();
const { getUsers, getUserById, registerUser, loginUser, updateUser, deleteUser } = require('../../controllers/users.controllers');
const { checkToken, checkAdmin, checkTargetNotAdmin } = require('../../utils/middleware');

router.get('/',     checkToken, checkAdmin, getUsers);
router.get('/:id',  checkToken, getUserById);

router.post('/register', registerUser);
router.post('/login',    loginUser);

// FIX 1: checkTargetNotAdmin protege admin→admin
// FIX 3: password_must_change se gestiona en el controller
router.put('/:id',    checkToken, checkAdmin, checkTargetNotAdmin, updateUser);
router.delete('/:id', checkToken, checkAdmin, checkTargetNotAdmin, deleteUser);

module.exports = router;