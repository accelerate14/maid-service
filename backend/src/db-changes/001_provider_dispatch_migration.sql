-- =====================================================================
-- Migration 001: provider side + dispatch foundation
-- Target: MySQL 8.0, database maid_service_db
-- BACK UP FIRST:  mysqldump -u root -p maid_service_db > backup_before_001.sql
-- Run top to bottom, once.
-- =====================================================================
USE maid_service_db;

-- ---------------------------------------------------------------------
-- 1. Provider profile (1:1 with users where role = service_provider)
--    Holds everything the dispatcher needs to decide "who gets the offer"
-- ---------------------------------------------------------------------
CREATE TABLE provider_profiles (
  user_id             INT NOT NULL,
  verification_status ENUM('pending','approved','rejected','suspended') NOT NULL DEFAULT 'pending',
  is_online           TINYINT(1) NOT NULL DEFAULT 0,
  service_radius_km   DECIMAL(5,2) NOT NULL DEFAULT 10.00,
  base_lat            DECIMAL(10,7) DEFAULT NULL,   -- home/base location
  base_lng            DECIMAL(10,7) DEFAULT NULL,
  current_lat         DECIMAL(10,7) DEFAULT NULL,   -- last known live location
  current_lng         DECIMAL(10,7) DEFAULT NULL,
  last_location_at    DATETIME DEFAULT NULL,
  last_seen_at        DATETIME DEFAULT NULL,
  bio                 TEXT,
  created_at          TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  KEY idx_pp_dispatch (verification_status, is_online),
  CONSTRAINT fk_pp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------
-- 2. Which services each provider can perform
-- ---------------------------------------------------------------------
CREATE TABLE provider_services (
  provider_id INT NOT NULL,
  service_id  INT NOT NULL,
  PRIMARY KEY (provider_id, service_id),
  KEY idx_ps_service (service_id),
  CONSTRAINT fk_ps_provider FOREIGN KEY (provider_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ps_service  FOREIGN KEY (service_id)  REFERENCES services (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------
-- 3. Push tokens (FCM). One user can have many devices/browsers.
-- ---------------------------------------------------------------------
CREATE TABLE device_tokens (
  id           INT NOT NULL AUTO_INCREMENT,
  user_id      INT NOT NULL,
  fcm_token    VARCHAR(512) NOT NULL,
  platform     ENUM('web','android','ios') NOT NULL DEFAULT 'web',
  created_at   TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_device_token (fcm_token(255)),
  KEY idx_dt_user (user_id),
  CONSTRAINT fk_dt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------
-- 4. Booking offers: THE core dispatch table.
--    One row per (booking, provider) the request was offered to.
--    The provider dashboard is simply: SELECT ... WHERE provider_id = ? AND status IN ('sent','seen')
-- ---------------------------------------------------------------------
CREATE TABLE booking_offers (
  id           INT NOT NULL AUTO_INCREMENT,
  booking_id   INT NOT NULL,
  provider_id  INT NOT NULL,
  wave         INT NOT NULL DEFAULT 1,
  status       ENUM('sent','seen','accepted','rejected','expired','withdrawn') NOT NULL DEFAULT 'sent',
  sent_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  seen_at      DATETIME DEFAULT NULL,
  responded_at DATETIME DEFAULT NULL,
  expires_at   DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_offer (booking_id, provider_id),            -- never offer the same job twice to one provider
  KEY idx_offer_provider (provider_id, status, expires_at), -- dashboard query
  KEY idx_offer_expiry (status, expires_at),                -- expiry worker query
  CONSTRAINT fk_offer_booking  FOREIGN KEY (booking_id)  REFERENCES bookings (id) ON DELETE CASCADE,
  CONSTRAINT fk_offer_provider FOREIGN KEY (provider_id) REFERENCES users (id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------
-- 5. In-app notification inbox (bell icon / history, survives missed pushes)
-- ---------------------------------------------------------------------
CREATE TABLE notifications (
  id         INT NOT NULL AUTO_INCREMENT,
  user_id    INT NOT NULL,
  type       VARCHAR(50) NOT NULL,        -- NEW_OFFER, OFFER_TAKEN, BOOKING_ASSIGNED, ...
  title      VARCHAR(150) NOT NULL,
  body       VARCHAR(500) DEFAULT NULL,
  data       JSON DEFAULT NULL,           -- {bookingId: 12, ...}
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notif_user (user_id, is_read, created_at),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------
-- 6. Status history (audit trail + customer-facing timeline)
-- ---------------------------------------------------------------------
CREATE TABLE booking_status_history (
  id         INT NOT NULL AUTO_INCREMENT,
  booking_id INT NOT NULL,
  status     VARCHAR(30) NOT NULL,
  changed_by INT DEFAULT NULL,            -- user id, NULL = system
  note       VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bsh_booking (booking_id, created_at),
  CONSTRAINT fk_bsh_booking FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------
-- 7. Changes to existing tables
-- ---------------------------------------------------------------------

-- 7a. bookings: richer lifecycle + dispatch bookkeeping
--     Old values (pending, assigned, completed, cancelled) keep their meaning.
--     pending     = created, waiting for dispatcher
--     searching   = offers are out to providers
--     assigned    = a provider accepted
--     no_provider = all waves expired, nobody accepted
ALTER TABLE bookings
  MODIFY COLUMN status ENUM('pending','searching','assigned','on_the_way','in_progress','completed','cancelled','no_provider')
    NOT NULL DEFAULT 'pending',
  ADD COLUMN total_amount   DECIMAL(10,2) DEFAULT NULL AFTER address_lng,
  ADD COLUMN notes          TEXT AFTER total_amount,
  ADD COLUMN dispatch_wave  INT NOT NULL DEFAULT 0 AFTER notes,
  ADD COLUMN assigned_at    DATETIME DEFAULT NULL AFTER dispatch_wave,
  ADD COLUMN completed_at   DATETIME DEFAULT NULL AFTER assigned_at,
  ADD COLUMN cancelled_at   DATETIME DEFAULT NULL AFTER completed_at,
  ADD COLUMN cancel_reason  VARCHAR(255) DEFAULT NULL AFTER cancelled_at,
  ADD KEY idx_bookings_status_date (status, scheduled_date),
  ADD KEY idx_bookings_provider_status (provider_id, status);

-- 7b. payments: real Razorpay fields (your dump only has 'dummy_gateway' and 'cod')
ALTER TABLE payments
  MODIFY COLUMN payment_method ENUM('dummy_gateway','cod','razorpay') NOT NULL,
  MODIFY COLUMN status ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  ADD COLUMN razorpay_order_id   VARCHAR(100) DEFAULT NULL AFTER transaction_id,
  ADD COLUMN razorpay_payment_id VARCHAR(100) DEFAULT NULL AFTER razorpay_order_id,
  ADD COLUMN razorpay_signature  VARCHAR(255) DEFAULT NULL AFTER razorpay_payment_id,
  ADD UNIQUE KEY uq_rzp_order (razorpay_order_id),
  ADD UNIQUE KEY uq_rzp_payment (razorpay_payment_id);

-- 7c. provider_ratings: tie each review to a real completed booking
ALTER TABLE provider_ratings
  ADD COLUMN booking_id  INT DEFAULT NULL AFTER provider_id,
  ADD COLUMN customer_id INT DEFAULT NULL AFTER booking_id,
  ADD UNIQUE KEY uq_rating_booking (booking_id),   -- one review per booking (NULLs allowed for old seed rows)
  ADD CONSTRAINT fk_rating_booking  FOREIGN KEY (booking_id)  REFERENCES bookings (id) ON DELETE SET NULL,
  ADD CONSTRAINT fk_rating_customer FOREIGN KEY (customer_id) REFERENCES users (id)    ON DELETE SET NULL;

-- ---------------------------------------------------------------------
-- 8. Permissions: role 3 (service_provider) currently has NONE
-- ---------------------------------------------------------------------
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE name IN ('view_bookings', 'accept_booking');

-- ---------------------------------------------------------------------
-- 9. Backfill so your 12 existing test providers work immediately
-- ---------------------------------------------------------------------
INSERT IGNORE INTO provider_profiles (user_id, verification_status)
SELECT id, 'approved' FROM users WHERE role_id = 3;

INSERT IGNORE INTO provider_services (provider_id, service_id)
SELECT u.id, s.id FROM users u CROSS JOIN services s WHERE u.role_id = 3;

-- Fix inconsistent seed data: booking 1 is 'assigned' but has no provider
UPDATE bookings SET status = 'pending' WHERE id = 1 AND provider_id IS NULL;

-- Bookings 2 and 3 were hard-assigned to provider 7 while still 'pending'.
-- Leave as-is for now; we decide in Step 2 whether customers pick a provider or the system dispatches.
