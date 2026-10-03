const express = require('express');
const router = express.Router();
const { authenticateToken, checkRole } = require('../middleware/auth');
const { validateBody } = require('../middleware/validate');
const customerController = require('../controllers/customerController');

// Public: Get all services
router.get('/services', customerController.getServices);

// Public: Get sub-services for a specific service
router.get('/services/:serviceId/sub-services', customerController.getSubServices);

// Auth: Get providers list with search
router.get('/providers', authenticateToken, customerController.getProvidersList);

// Auth: Get single provider details + reviews
router.get('/providers/:providerId', authenticateToken, customerController.getProviderDetails);

// Auth + Customer: Create a booking
router.post('/bookings', authenticateToken, checkRole(['customer']), validateBody('booking'), customerController.createBooking);

// Auth + Customer: Get user's bookings
router.get('/bookings', authenticateToken, checkRole(['customer']), customerController.getBookings);

// Auth + Customer: SSE Endpoint for Live Booking Status
router.get('/bookings/live', authenticateToken, checkRole(['customer']), customerController.setupSSE);

module.exports = {
  router,
  emitBookingUpdate: customerController.emitBookingUpdate
};
