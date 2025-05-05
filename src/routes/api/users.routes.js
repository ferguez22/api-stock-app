const router = require('express').Router();
const {getUsers, getUserById, registerUser, loginUser, updateUser, deleteUser} = require('../../controllers/users.controllers');
const { checkToken } = require('../../utils/middleware');

router.get('/', getUsers);
router.get('/:id', checkToken, getUserById); // Nueva ruta para obtener un usuario por ID

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;