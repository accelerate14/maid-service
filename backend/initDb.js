const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
  try {
    // Connect to MySQL server without selecting a database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
    });

    console.log('Connected to MySQL server.');

    // Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS maid_service_db;`);
    console.log('Database created or already exists.');

    // Switch to the created database
    await connection.changeUser({ database: 'maid_service_db' });

    // Create Roles Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    // Create Permissions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );
    `);

    // Create Role_Permissions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INT NOT NULL,
        permission_id INT NOT NULL,
        PRIMARY KEY (role_id, permission_id),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
      );
    `);

    // Create Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address VARCHAR(255),
        address_lat DECIMAL(10, 7) NULL,
        address_lng DECIMAL(10, 7) NULL,
        role_id INT NOT NULL,
        reset_token_hash VARCHAR(255),
        reset_token_expires_at DATETIME,
        refresh_token VARCHAR(500),
        refresh_token_expires_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
      );
    `);

    // Create Services Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        duration_minutes INT NOT NULL,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Bookings Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        service_id INT NOT NULL,
        provider_id INT DEFAULT NULL,
        status ENUM('pending', 'assigned', 'completed', 'cancelled') DEFAULT 'pending',
        scheduled_date DATE NOT NULL,
        scheduled_time TIME NOT NULL,
        address VARCHAR(255) NOT NULL,
        address_lat DECIMAL(10, 7) NULL,
        address_lng DECIMAL(10, 7) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `);

    // Create Payments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('dummy_gateway', 'cod') NOT NULL,
        status ENUM('pending', 'paid') DEFAULT 'pending',
        transaction_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
      );
    `);

    console.log('Tables created successfully.');

    // Seed Roles
    const [existingRoles] = await connection.query('SELECT * FROM roles');
    if (existingRoles.length === 0) {
      await connection.query(`
        INSERT INTO roles (name) VALUES 
        ('admin'), ('service_manager'), ('service_provider'), ('customer');
      `);
      console.log('Roles seeded.');
    }

    // Seed Permissions
    const [existingPerms] = await connection.query('SELECT * FROM permissions');
    if (existingPerms.length === 0) {
      await connection.query(`
        INSERT INTO permissions (name) VALUES 
        ('manage_users'), ('manage_services'), ('view_bookings'), ('create_booking'), ('manage_bookings'), ('accept_booking');
      `);
      console.log('Permissions seeded.');
    }

    // Map basic roles and permissions (simplification)
    const [existingRolePerms] = await connection.query('SELECT * FROM role_permissions');
    if (existingRolePerms.length === 0) {
      // Customer permissions
      await connection.query(`
        INSERT INTO role_permissions (role_id, permission_id) 
        SELECT r.id, p.id FROM roles r, permissions p 
        WHERE r.name = 'customer' AND p.name IN ('view_bookings', 'create_booking');
      `);
      // Admin permissions
      await connection.query(`
        INSERT INTO role_permissions (role_id, permission_id) 
        SELECT r.id, p.id FROM roles r, permissions p 
        WHERE r.name = 'admin';
      `);
      console.log('Role Permissions seeded.');
    }

    // Seed Services
    const [existingServices] = await connection.query('SELECT * FROM services');
    if (existingServices.length === 0) {
      await connection.query(`
        INSERT INTO services (name, description, price, duration_minutes, image_url) VALUES 
        ('Standard Cleaning', 'General dusting, vacuuming, mopping, and bathroom cleaning.', 50.00, 120, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2070&auto=format&fit=crop'),
        ('Deep Cleaning', 'Intensive cleaning including inside cabinets, appliances, and hard-to-reach areas.', 100.00, 240, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2070&auto=format&fit=crop'),
        ('Move-In/Move-Out', 'Thorough cleaning for empty homes to prepare for new occupants.', 150.00, 300, 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=1974&auto=format&fit=crop');
      `);
      console.log('Services seeded.');
    }

    await connection.end();
    console.log('Database initialization completed.');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDB();
