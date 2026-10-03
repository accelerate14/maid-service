const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const adminController = require('../controllers/adminController');

// All admin routes require authentication and admin/manager role
router.use(authenticateToken, checkRole(['admin', 'service_manager']));

// Get all bookings
router.get('/bookings', adminController.getAllBookings);

// Get all providers
router.get('/providers', adminController.getProviders);

// Update booking status
router.put('/bookings/:id/status', validateBody('bookingStatus'), adminController.updateBookingStatus);

// Assign provider to a booking
router.put('/bookings/:id/assign', validateBody('assignProvider'), adminController.assignProvider);

module.exports = router;
