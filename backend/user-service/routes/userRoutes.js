const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Auth is handled centrally by the API Gateway.
// The gateway injects x-user-id and user-id headers after verifying the JWT.

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

module.exports = router;
