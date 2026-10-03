const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '.env' });

async function updateDB() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: process.env.DB_NAME || 'maid_service_db'
    });

    console.log('Connected to Database. Adding provider_id column...');
    
    // Add provider_id column if it doesn't exist
    try {
      await connection.query('ALTER TABLE bookings ADD COLUMN provider_id INT DEFAULT NULL, ADD FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL');
      console.log('provider_id column added successfully.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('provider_id column already exists.');
      } else {
        throw err;
      }
    }

    // Ensure a provider exists
    console.log('Creating a dummy service provider...');
    const [roles] = await connection.query('SELECT id FROM roles WHERE name = ?', ['service_provider']);
    const providerRoleId = roles[0].id;

    const [providers] = await connection.query('SELECT id FROM users WHERE email = ?', ['provider@example.com']);
    
    if (providers.length === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await connection.query(
        'INSERT INTO users (name, email, password_hash, phone, role_id) VALUES (?, ?, ?, ?, ?)',
        ['Test Provider', 'provider@example.com', hashedPassword, '555-9876', providerRoleId]
      );
      console.log('Dummy provider created (provider@example.com / password123).');
    } else {
      console.log('Dummy provider already exists.');
    }

    await connection.end();
    console.log('Database update completed.');
  } catch (error) {
    console.error('Error updating database:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

updateDB();
