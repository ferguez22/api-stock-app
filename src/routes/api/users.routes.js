
const router = require('express').Router();
const {getUsers, registerUser, loginUser, updateUser, deleteUser} = require('../../controllers/users.controllers');

router.get('/', getUsers);

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;