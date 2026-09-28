const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, (req, res) => {
  // Return the decoded token payload (id, username)
  res.json(req.user);
});

module.exports = router;
