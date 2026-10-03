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

    console.log('Connected. Running Phase 5 migrations...');

    // 1. Create sub_services table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sub_services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ sub_services table created');

    // 2. Create booking_sub_services junction table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS booking_sub_services (
        booking_id INT NOT NULL,
        sub_service_id INT NOT NULL,
        PRIMARY KEY (booking_id, sub_service_id),
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
        FOREIGN KEY (sub_service_id) REFERENCES sub_services(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ booking_sub_services table created');

    // 3. Create provider_ratings table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS provider_ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        rating DECIMAL(2,1) NOT NULL,
        review TEXT,
        customer_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
    console.log('✓ provider_ratings table created');

    // 4. Seed sub-services
    const [existingSubs] = await connection.query('SELECT COUNT(*) as cnt FROM sub_services');
    if (existingSubs[0].cnt === 0) {
      // Get service IDs
      const [services] = await connection.query('SELECT id, name FROM services');
      const serviceMap = {};
      services.forEach(s => { serviceMap[s.name] = s.id; });

      const subServices = [
        // Standard Cleaning
        { service: 'Standard Cleaning', name: 'Living Room Cleaning', desc: 'Dusting, vacuuming, and mopping of all living areas.', price: 25.00 },
        { service: 'Standard Cleaning', name: 'Bedroom Cleaning', desc: 'Bed making, dusting furniture, vacuuming carpet.', price: 20.00 },
        { service: 'Standard Cleaning', name: 'Kitchen Cleaning', desc: 'Counter wiping, sink scrubbing, floor mopping.', price: 30.00 },
        { service: 'Standard Cleaning', name: 'Bathroom Sanitization', desc: 'Toilet, sink, mirror, and shower scrubbing.', price: 25.00 },
        { service: 'Standard Cleaning', name: 'Window Cleaning (Interior)', desc: 'Interior window and sill cleaning.', price: 15.00 },
        // Deep Cleaning
        { service: 'Deep Cleaning', name: 'Oven & Stovetop Scrub', desc: 'Deep degreasing and scrubbing of oven interior and stovetop.', price: 35.00 },
        { service: 'Deep Cleaning', name: 'Fridge Deep Clean', desc: 'Full interior wipe-down, shelf removal, and sanitization.', price: 30.00 },
        { service: 'Deep Cleaning', name: 'Tile & Grout Restoration', desc: 'Deep scrubbing and whitening of tile grout lines.', price: 40.00 },
        { service: 'Deep Cleaning', name: 'Carpet Shampooing', desc: 'Hot water extraction carpet deep cleaning.', price: 50.00 },
        { service: 'Deep Cleaning', name: 'Cabinet Interior Wipe', desc: 'Emptying, wiping, and reorganizing kitchen and bathroom cabinets.', price: 25.00 },
        { service: 'Deep Cleaning', name: 'Baseboard & Trim Detailing', desc: 'Detailed scrubbing of all baseboards and door trims.', price: 20.00 },
        // Move-In/Move-Out
        { service: 'Move-In/Move-Out', name: 'Full Wall Washing', desc: 'Washing all walls to remove scuffs, marks, and dust.', price: 45.00 },
        { service: 'Move-In/Move-Out', name: 'Closet & Storage Clean', desc: 'Deep cleaning inside all closets and storage spaces.', price: 25.00 },
        { service: 'Move-In/Move-Out', name: 'Garage Sweep & Mop', desc: 'Full floor sweep, mop, and cobweb removal of garage.', price: 35.00 },
        { service: 'Move-In/Move-Out', name: 'Light Fixture Cleaning', desc: 'Removing and cleaning all light fixtures and ceiling fans.', price: 30.00 },
        { service: 'Move-In/Move-Out', name: 'Appliance Exterior Polish', desc: 'Polishing exterior of all major appliances.', price: 20.00 },
      ];

      for (const sub of subServices) {
        const serviceId = serviceMap[sub.service];
        if (serviceId) {
          await connection.query(
            'INSERT INTO sub_services (service_id, name, description, price) VALUES (?, ?, ?, ?)',
            [serviceId, sub.name, sub.desc, sub.price]
          );
        }
      }
      console.log('✓ Sub-services seeded');
    }

    // 5. Seed many dummy providers
    const [providerRole] = await connection.query('SELECT id FROM roles WHERE name = ?', ['service_provider']);
    const providerRoleId = providerRole[0].id;
    const hashedPassword = await bcrypt.hash('password123', 10);

    const providers = [
      { name: 'Maria Garcia', email: 'maria@sparklemaid.com', phone: '555-1001' },
      { name: 'James Wilson', email: 'james@sparklemaid.com', phone: '555-1002' },
      { name: 'Sarah Johnson', email: 'sarah@sparklemaid.com', phone: '555-1003' },
      { name: 'David Chen', email: 'david@sparklemaid.com', phone: '555-1004' },
      { name: 'Emma Thompson', email: 'emma@sparklemaid.com', phone: '555-1005' },
      { name: 'Carlos Rodriguez', email: 'carlos@sparklemaid.com', phone: '555-1006' },
      { name: 'Aisha Patel', email: 'aisha@sparklemaid.com', phone: '555-1007' },
      { name: 'Robert Kim', email: 'robert@sparklemaid.com', phone: '555-1008' },
      { name: 'Lisa Anderson', email: 'lisa@sparklemaid.com', phone: '555-1009' },
      { name: 'Michael Brown', email: 'michael@sparklemaid.com', phone: '555-1010' },
    ];

    let createdProviders = [];
    for (const p of providers) {
      const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [p.email]);
      if (existing.length === 0) {
        const [result] = await connection.query(
          'INSERT INTO users (name, email, password_hash, phone, role_id) VALUES (?, ?, ?, ?, ?)',
          [p.name, p.email, hashedPassword, p.phone, providerRoleId]
        );
        createdProviders.push({ id: result.insertId, name: p.name });
      } else {
        createdProviders.push({ id: existing[0].id, name: p.name });
      }
    }
    // Also include the original test provider
    const [origProvider] = await connection.query('SELECT id, name FROM users WHERE email = ?', ['provider@example.com']);
    if (origProvider.length > 0) {
      createdProviders.push({ id: origProvider[0].id, name: origProvider[0].name });
    }
    console.log(`✓ ${createdProviders.length} providers ready`);

    // 6. Seed dummy ratings for all providers
    const [existingRatings] = await connection.query('SELECT COUNT(*) as cnt FROM provider_ratings');
    if (existingRatings[0].cnt === 0) {
      const reviewTemplates = [
        { rating: 5.0, review: 'Absolutely fantastic! Left my home sparkling clean.', customer: 'Alice M.' },
        { rating: 4.5, review: 'Very thorough and professional. Would book again.', customer: 'Bob T.' },
        { rating: 5.0, review: 'Best cleaning service I have ever used. Highly recommend!', customer: 'Carol S.' },
        { rating: 4.0, review: 'Great job overall, very punctual and polite.', customer: 'Dan W.' },
        { rating: 4.5, review: 'Excellent attention to detail. My kitchen has never looked better.', customer: 'Eva R.' },
        { rating: 3.5, review: 'Good service, but missed a few spots under the furniture.', customer: 'Frank L.' },
        { rating: 5.0, review: 'Incredible! They even organized my pantry without being asked.', customer: 'Grace H.' },
        { rating: 4.0, review: 'Reliable and hardworking. Fair pricing too.', customer: 'Henry J.' },
        { rating: 4.5, review: 'My go-to cleaner now. Consistent quality every time.', customer: 'Irene K.' },
        { rating: 5.0, review: 'Wow! The deep clean was beyond my expectations.', customer: 'Jake P.' },
      ];

      for (const provider of createdProviders) {
        // Give each provider 3-5 random reviews
        const numReviews = 3 + Math.floor(Math.random() * 3);
        const shuffled = [...reviewTemplates].sort(() => 0.5 - Math.random());
        for (let i = 0; i < numReviews; i++) {
          const r = shuffled[i];
          await connection.query(
            'INSERT INTO provider_ratings (provider_id, rating, review, customer_name) VALUES (?, ?, ?, ?)',
            [provider.id, r.rating, r.review, r.customer]
          );
        }
      }
      console.log('✓ Provider ratings seeded');
    }

    // 7. Remove price from services table conceptually — we keep it for backwards compat
    // but the frontend will now calculate total from sub-services only.
    // Update service prices to 0 to reflect "no base price"
    await connection.query('UPDATE services SET price = 0.00');
    console.log('✓ Service base prices set to $0 (sub-service pricing model)');

    await connection.end();
    console.log('\n✅ Phase 5 database update completed!');
  } catch (error) {
    console.error('Error:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

updateDB();
