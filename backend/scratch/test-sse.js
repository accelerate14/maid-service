const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '../.env' }); // load from backend root

async function triggerSSE() {
  let connection;
  try {
    // 1. Connect to DB
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'maid_service_db'
    });

    // 2. Ensure an Admin user exists
    const [roles] = await connection.query('SELECT id FROM roles WHERE name = ?', ['admin']);
    const adminRoleId = roles[0].id;

    const [adminUsers] = await connection.query('SELECT * FROM users WHERE email = ?', ['admin@sparklemaid.com']);
    let adminUser = adminUsers[0];

    if (!adminUser) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const [insertResult] = await connection.query(
        'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
        ['Super Admin', 'admin@sparklemaid.com', hashedPassword, adminRoleId]
      );
      adminUser = {
        id: insertResult.insertId,
        email: 'admin@sparklemaid.com',
        role_name: 'admin'
      };
    } else {
      adminUser.role_name = 'admin'; // mock for JWT
    }

    // 3. Generate Admin JWT Token
    const token = jwt.sign(
      { id: adminUser.id, email: adminUser.email, role: adminUser.role_name },
      process.env.JWT_SECRET || 'super_secret_jwt_key_12345',
      { expiresIn: '1h' }
    );

    // 4. Find the latest booking to update
    const [bookings] = await connection.query('SELECT id, status FROM bookings ORDER BY id DESC LIMIT 1');
    if (bookings.length === 0) {
      console.log('❌ No bookings found! Please log in to the frontend and create a booking first.');
      process.exit(0);
    }
    
    const booking = bookings[0];
    const newStatus = booking.status === 'pending' ? 'assigned' : 'completed';

    // 5. Call the API
    console.log(`\nTriggering Admin API to update Booking #${booking.id} to '${newStatus}'...`);
    
    const fetchAPI = globalThis.fetch;
    
    const response = await fetchAPI(`http://localhost:5000/api/admin/bookings/${booking.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const result = await response.json();
    console.log('API Response:', result);
    console.log('\n✅ If you have the frontend open, you should have just seen the Live Status toast pop up!');
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    if (connection) await connection.end();
  }
}

triggerSSE();
