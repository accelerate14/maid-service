const db = require('../db');

// SSE clients map
const sseClients = new Map();

const getServices = async (req, res) => {
  try {
    const [services] = await db.query('SELECT * FROM services');
    res.json(services);
  } catch (error) {
    console.error('[CustomerController Error (getServices)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getSubServices = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const [subServices] = await db.query(
      'SELECT * FROM sub_services WHERE service_id = ? ORDER BY price ASC',
      [serviceId]
    );
    res.json(subServices);
  } catch (error) {
    console.error('[CustomerController Error (getSubServices)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProvidersList = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.phone,
        COALESCE(AVG(pr.rating), 0) as avg_rating,
        COUNT(pr.id) as review_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN provider_ratings pr ON u.id = pr.provider_id
      WHERE r.name = 'service_provider'
    `;
    const params = [];

    if (search) {
      query += ' AND u.name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' GROUP BY u.id ORDER BY avg_rating DESC';
    const [providers] = await db.query(query, params);
    res.json(providers);
  } catch (error) {
    console.error('[CustomerController Error (getProvidersList)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProviderDetails = async (req, res) => {
  try {
    const { providerId } = req.params;

    const [providers] = await db.query(`
      SELECT u.id, u.name, u.email, u.phone,
        COALESCE(AVG(pr.rating), 0) as avg_rating,
        COUNT(pr.id) as review_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN provider_ratings pr ON u.id = pr.provider_id
      WHERE u.id = ? AND r.name = 'service_provider'
      GROUP BY u.id
    `, [providerId]);

    if (providers.length === 0) {
      return res.status(404).json({ error: 'Provider not found' });
    }

    const [reviews] = await db.query(
      'SELECT rating, review, customer_name, created_at FROM provider_ratings WHERE provider_id = ? ORDER BY created_at DESC',
      [providerId]
    );

    res.json({ ...providers[0], reviews });
  } catch (error) {
    console.error('[CustomerController Error (getProviderDetails)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createBooking = async (req, res) => {
  try {
    const { service_id, sub_service_ids, scheduled_date, scheduled_time, payment_method, provider_id, address, address_lat, address_lng } = req.body;
    const customer_id = req.user.id;

    // Calculate total from sub-services only
    const [subServices] = await db.query(
      'SELECT id, price FROM sub_services WHERE id IN (?) AND service_id = ?',
      [sub_service_ids, service_id]
    );

    if (subServices.length === 0) {
      return res.status(400).json({ error: 'Invalid sub-services selected' });
    }

    const amount = subServices.reduce((sum, s) => sum + parseFloat(s.price), 0);

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const [bookingResult] = await conn.query(
        'INSERT INTO bookings (customer_id, service_id, provider_id, scheduled_date, scheduled_time, address, address_lat, address_lng) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [customer_id, service_id, provider_id, scheduled_date, scheduled_time, address, address_lat || null, address_lng || null]
      );
      const booking_id = bookingResult.insertId;

      // Insert sub-service selections
      for (const subId of sub_service_ids) {
        await conn.query(
          'INSERT INTO booking_sub_services (booking_id, sub_service_id) VALUES (?, ?)',
          [booking_id, subId]
        );
      }

      // Insert payment
      const paymentStatus = payment_method === 'dummy_gateway' ? 'paid' : 'pending';
      const transaction_id = payment_method === 'dummy_gateway' ? `TXN_${Date.now()}_${Math.floor(Math.random() * 1000)}` : null;

      await conn.query(
        'INSERT INTO payments (booking_id, amount, payment_method, status, transaction_id) VALUES (?, ?, ?, ?, ?)',
        [booking_id, amount, payment_method, paymentStatus, transaction_id]
      );

      await conn.commit();
      res.status(201).json({ message: 'Booking created successfully', booking_id });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('[CustomerController Error (createBooking)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getBookings = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const [bookings] = await db.query(`
      SELECT b.id, b.status, b.scheduled_date, b.scheduled_time, b.address, b.address_lat, b.address_lng,
        s.name as service_name, p.payment_method, p.status as payment_status, p.amount as price,
        prov.name as provider_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      LEFT JOIN payments p ON b.id = p.booking_id
      LEFT JOIN users prov ON b.provider_id = prov.id
      WHERE b.customer_id = ?
      ORDER BY b.created_at DESC
    `, [customer_id]);
    
    res.json(bookings);
  } catch (error) {
    console.error('[CustomerController Error (getBookings)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const setupSSE = (req, res) => {
  const customerId = req.user.id;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  if (!sseClients.has(customerId)) {
    sseClients.set(customerId, new Set());
  }
  sseClients.get(customerId).add(res);

  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE Connection Established' })}\n\n`);

  req.on('close', () => {
    const clientSet = sseClients.get(customerId);
    if (clientSet) {
      clientSet.delete(res);
      if (clientSet.size === 0) {
        sseClients.delete(customerId);
      }
    }
  });
};

const emitBookingUpdate = (customerId, bookingId, newStatus) => {
  const clientSet = sseClients.get(customerId);
  if (clientSet) {
    const message = `data: ${JSON.stringify({ type: 'status_update', bookingId, newStatus })}\n\n`;
    clientSet.forEach(res => res.write(message));
  }
};

module.exports = {
  getServices,
  getSubServices,
  getProvidersList,
  getProviderDetails,
  createBooking,
  getBookings,
  setupSSE,
  emitBookingUpdate
};
