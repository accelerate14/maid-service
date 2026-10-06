const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const { createOrder, verifyPayment } = require('../controllers/orderController');

router.post('/create-order', authenticateToken, checkRole(['customer']), validateBody('createOrder'), createOrder);
router.post('/verify-payment', authenticateToken, checkRole(['customer']), verifyPayment);

module.exports = router;