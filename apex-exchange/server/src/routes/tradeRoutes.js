const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const tradeController = require('../controllers/tradeController');
const portfolioController = require('../controllers/portfolioController');

router.post('/order', authenticate, tradeController.placeOrder);
router.get('/portfolio', authenticate, portfolioController.getPortfolio);

module.exports = router;
