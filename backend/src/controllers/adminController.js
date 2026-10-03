const db = require('../db');
const { emitBookingUpdate } = require('./customerController');

const getAllBookings = async (req, res) => {
  try {
    const [bookings] = await db.query(`
      SELECT b.*, c.name as customer_name, s.name as service_name, p.name as provider_name 
      FROM bookings b
      JOIN users c ON b.customer_id = c.id
      JOIN services s ON b.service_id = s.id
      LEFT JOIN users p ON b.provider_id = p.id
      ORDER BY b.created_at DESC
    `);
    res.json(bookings);
  } catch (error) {
    console.error('[AdminController Error (getAllBookings)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProviders = async (req, res) => {
  try {
    const [providers] = await db.query(`
      SELECT u.id, u.name, u.email, u.phone 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'service_provider'
    `);
    res.json(providers);
  } catch (error) {
    console.error('[AdminController Error (getProviders)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const assignProvider = async (req, res) => {
  try {
    const { id } = req.params;
    const { provider_id } = req.body;

    // First, check if booking exists and get the customer_id
    const [bookings] = await db.query('SELECT customer_id FROM bookings WHERE id = ?', [id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const customerId = bookings[0].customer_id;

    // Update the provider and change status to assigned
    await db.query('UPDATE bookings SET provider_id = ?, status = ? WHERE id = ?', [provider_id, 'assigned', id]);

    // Emit the SSE to the connected customer
    emitBookingUpdate(customerId, id, 'assigned');

    res.json({ message: 'Provider assigned successfully', status: 'assigned' });
  } catch (error) {
    console.error('[AdminController Error (assignProvider)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // First, check if booking exists and get the customer_id
    const [bookings] = await db.query('SELECT customer_id FROM bookings WHERE id = ?', [id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const customerId = bookings[0].customer_id;

    // Update the status in the database
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    // Emit the SSE to the connected customer
    emitBookingUpdate(customerId, id, status);

    res.json({ message: 'Booking status updated successfully', status });
  } catch (error) {
    console.error('[AdminController Error (updateBookingStatus)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllBookings,
  getProviders,
  assignProvider,
  updateBookingStatus
};
