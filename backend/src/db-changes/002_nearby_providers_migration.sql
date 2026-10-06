-- =====================================================================
-- Migration 002: support "customer browses nearby providers and picks one"
-- Run AFTER 001.
-- =====================================================================
USE maid_service_db;

-- 1. Info customers need to choose someone to let into their home
ALTER TABLE provider_profiles
  ADD COLUMN profile_photo_url VARCHAR(255) DEFAULT NULL AFTER bio,
  ADD COLUMN experience_years  TINYINT UNSIGNED DEFAULT NULL AFTER profile_photo_url,
  ADD COLUMN languages         VARCHAR(100) DEFAULT NULL AFTER experience_years,
  ADD KEY idx_pp_geo (base_lat, base_lng);   -- speeds up the bounding-box prefilter

-- 2. In this model is_online = "accepting new bookings" (a provider toggle).
--    001 defaulted it to 0, so switch it on for approved providers.
UPDATE provider_profiles SET is_online = 1 WHERE verification_status = 'approved';

-- 3. Give test providers coordinates scattered around a point you choose.
--    >>> SET THESE to a point near your test customer's address <<<
SET @center_lat = 0;
SET @center_lng = 0;

-- Spread is about +/- 5 km. Skipped automatically if you forgot to set the center.
UPDATE provider_profiles
SET base_lat          = @center_lat + (RAND() - 0.5) * 0.09,
    base_lng          = @center_lng + (RAND() - 0.5) * 0.09,
    service_radius_km = 8 + FLOOR(RAND() * 8),          -- 8 to 15 km
    experience_years  = 1 + FLOOR(RAND() * 9),
    languages         = 'English, Hindi'
WHERE base_lat IS NULL
  AND @center_lat <> 0
  AND @center_lng <> 0;

-- Sanity check
SELECT u.id, u.name, pp.base_lat, pp.base_lng, pp.service_radius_km, pp.is_online
FROM provider_profiles pp JOIN users u ON u.id = pp.user_id;
