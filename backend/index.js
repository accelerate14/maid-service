const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const razorpay = require('razorpay');

const authRoutes = require('./src/routes/auth');
const customerRoutes = require('./src/routes/customer');
const adminRoutes = require('./src/routes/admin');
const orderRoutes = require('./src/routes/order');
const db = require('./src/db');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev')); // Backend logging

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes.router);
app.use('/api/admin', adminRoutes);
app.use('/api/order', orderRoutes);

async function ensureSchemaColumns() {
  try {
    const [userColumns] = await db.query(`
      SELECT COLUMN_NAME, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
    `);
    const usersColumnNames = userColumns.map((column) => column.COLUMN_NAME);
    const passwordHashColumn = userColumns.find((column) => column.COLUMN_NAME === 'password_hash');
    if (passwordHashColumn?.IS_NULLABLE === 'NO') {
      await db.query('ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL');
    }
    if (!usersColumnNames.includes('reset_token_hash')) {
      await db.query('ALTER TABLE users ADD COLUMN reset_token_hash VARCHAR(255) NULL');
    }
    if (!usersColumnNames.includes('reset_token_expires_at')) {
      await db.query('ALTER TABLE users ADD COLUMN reset_token_expires_at DATETIME NULL');
    }
    if (!usersColumnNames.includes('refresh_token')) {
      await db.query('ALTER TABLE users ADD COLUMN refresh_token VARCHAR(500) NULL');
    }
    if (!usersColumnNames.includes('refresh_token_expires_at')) {
      await db.query('ALTER TABLE users ADD COLUMN refresh_token_expires_at DATETIME NULL');
    }
    if (!usersColumnNames.includes('address')) {
      await db.query('ALTER TABLE users ADD COLUMN address VARCHAR(255) NULL');
    }
    if (!usersColumnNames.includes('address_lat')) {
      await db.query('ALTER TABLE users ADD COLUMN address_lat DECIMAL(10, 7) NULL');
    }
    if (!usersColumnNames.includes('address_lng')) {
      await db.query('ALTER TABLE users ADD COLUMN address_lng DECIMAL(10, 7) NULL');
    }

    const [bookingColumns] = await db.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings'
    `);
    const bookingsColumnNames = bookingColumns.map((column) => column.COLUMN_NAME);
    if (!bookingsColumnNames.includes('address')) {
      await db.query('ALTER TABLE bookings ADD COLUMN address VARCHAR(255) NULL');
    }
    if (!bookingsColumnNames.includes('address_lat')) {
      await db.query('ALTER TABLE bookings ADD COLUMN address_lat DECIMAL(10, 7) NULL');
    }
    if (!bookingsColumnNames.includes('address_lng')) {
      await db.query('ALTER TABLE bookings ADD COLUMN address_lng DECIMAL(10, 7) NULL');
    }
    if (!bookingsColumnNames.includes('provider_id')) {
      await db.query('ALTER TABLE bookings ADD COLUMN provider_id INT DEFAULT NULL');
      await db.query('ALTER TABLE bookings ADD FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL');
    }
  } catch (error) {
    console.error('Failed to ensure schema columns:', error);
  }
}

ensureSchemaColumns();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
