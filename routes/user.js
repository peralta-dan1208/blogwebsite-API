const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.js');
const { verify } = require('../auth');

router.post('/login', userController.loginUser);
router.post('/register', userController.registerUser);
router.get('/details', verify, userController.getProfile);

module.exports = router;