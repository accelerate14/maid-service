const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../db');
const { getFirebaseAuth } = require('../firebaseAdmin');

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address, address_lat, address_lng } = req.body;

    const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) return res.status(400).json({ error: 'Email already registered' });

    const [roles] = await db.query('SELECT id FROM roles WHERE name = ?', ['customer']);
    if (roles.length === 0) return res.status(500).json({ error: 'Customer role not found in DB' });
    const customerRoleId = roles[0].id;

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, phone, address, address_lat, address_lng, role_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, address, address_lat || null, address_lng || null, customerRoleId]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    console.error('[AuthController Error (Register)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const googleAuth = async (req, res) => {
  try {
    const { idToken, phone, address, address_lat, address_lng } = req.body;
    const firebaseAuth = getFirebaseAuth();
    let identity;

    try {
      identity = await firebaseAuth.verifyIdToken(idToken);
    } catch (error) {
      console.warn('[AuthController Google Auth] Firebase ID token verification failed:', error.message);
      return res.status(401).json({ error: 'Google sign-in could not be verified. Please try again.' });
    }

    if (
      identity.firebase?.sign_in_provider !== 'google.com' ||
      !identity.email ||
      identity.email_verified !== true
    ) {
      return res.status(401).json({ error: 'A verified Google account is required' });
    }

    const email = identity.email;
    const name = identity.name || email.split('@')[0];

    // 1. Fetch user along with role name
    const [existingUsers] = await db.query(
      `SELECT u.*, r.name AS role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.email = ?`,
      [email]
    );

    let user;

    if (existingUsers.length > 0) {
      // User exists -> Existing user flow
      user = existingUsers[0];
    } else {
      // User does not exist -> Create new customer account
      const [roles] = await db.query('SELECT id, name FROM roles WHERE name = ?', ['customer']);
      if (roles.length === 0) return res.status(500).json({ error: 'Customer role not found in DB' });
      
      const customerRoleId = roles[0].id;
      const customerRoleName = roles[0].name;

      const [insertResult] = await db.query(
        'INSERT INTO users (name, email, phone, address, address_lat, address_lng, role_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [name, email, phone || null, address || null, address_lat || null, address_lng || null, customerRoleId]
      );

      user = {
        id: insertResult.insertId,
        name,
        email,
        role_name: customerRoleName,
        address: address || null,
        address_lat: address_lat || null,
        address_lng: address_lng || null
      };
    }

    // 2. Generate Access and Refresh Tokens
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name, tokenType: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name, tokenType: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    const refreshExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2)
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    // 3. Persist Refresh Token to Database
    await db.query(
      'UPDATE users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id = ?',
      [refreshToken, refreshExpiresAt, user.id]
    );

    // 4. Return response
    return res.json({
      message: existingUsers.length > 0 ? 'Login successful' : 'User registered successfully',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        address: user.address || null,
        address_lat: user.address_lat || null,
        address_lng: user.address_lng || null
      }
    });

  } catch (error) {
    console.error('[AuthController Error (Google Auth)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await db.query(`
      SELECT u.*, r.name as role_name 
      FROM users u 
      JOIN roles r ON u.role_id = r.id 
      WHERE u.email = ?
    `, [email]);

    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = users[0];
    if (!user.password_hash) {
      return res.status(401).json({
        error: 'This account uses Google sign-in. Please continue with Google.'
      });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name, tokenType: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role_name, tokenType: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    const refreshExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      'UPDATE users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id = ?',
      [refreshToken, refreshExpiresAt, user.id]
    );

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role_name,
        address: user.address || null,
        address_lat: user.address_lat || null,
        address_lng: user.address_lng || null
      }
    });
  } catch (error) {
    console.error('[AuthController Error (Login)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const [users] = await db.query('SELECT id, email FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'No account found with that email' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    await db.query(
      'UPDATE users SET reset_token_hash = ?, reset_token_expires_at = DATE_ADD(NOW(), INTERVAL 300 SECOND) WHERE id = ?',
      [otpHash, users[0].id]
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your password reset OTP',
      text: `Your password reset OTP is ${otp}. It expires in 5 minutes.`
    });

    res.json({
      message: 'A one-time password has been sent to your email.'
    });
  } catch (error) {
    console.error('[AuthController Error (ForgotPassword)]:', error);
    res.status(500).json({ error: 'Unable to send password reset email' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;
    const [users] = await db.query(
      'SELECT id, reset_token_hash, reset_token_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'No account found with that email' });
    }

    const user = users[0];
    if (!user.reset_token_hash || !user.reset_token_expires_at) {
      return res.status(400).json({ error: 'No password reset OTP was requested' });
    }

    const rawExpiresAt = user.reset_token_expires_at;
    const expiresAt = rawExpiresAt instanceof Date
      ? rawExpiresAt
      : new Date(typeof rawExpiresAt === 'string' ? rawExpiresAt.replace(' ', 'T') : rawExpiresAt);
    const isStillValid = expiresAt && expiresAt > new Date();

    if (!isStillValid) {
      await db.query('UPDATE users SET reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?', [user.id]);
      return res.status(400).json({ error: 'OTP has expired' });
    }

    const isMatch = await bcrypt.compare(otp, user.reset_token_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      'UPDATE users SET password_hash = ?, reset_token_hash = NULL, reset_token_expires_at = NULL WHERE id = ?',
      [hashedPassword, user.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[AuthController Error (ResetPassword)]:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: 'Refresh token missing' });

    const [users] = await db.query('SELECT id, email, refresh_token, refresh_token_expires_at, role_id FROM users WHERE refresh_token = ?', [refreshToken]);
    if (users.length === 0) return res.status(401).json({ error: 'Session expired. Please log in again.' });

    const user = users[0];
    const now = new Date();
    const expiresAt = new Date(user.refresh_token_expires_at);

    if (expiresAt <= now) {
      await db.query('UPDATE users SET refresh_token = NULL, refresh_token_expires_at = NULL WHERE id = ?', [user.id]);
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (payload.tokenType !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const [roles] = await db.query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
    const roleName = roles[0]?.name || 'customer';

    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email, role: roleName, tokenType: 'access' },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    const newRefreshToken = jwt.sign(
      { id: user.id, email: user.email, role: roleName, tokenType: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: '2d' }
    );

    const newRefreshExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().slice(0, 19).replace('T', ' ');

    await db.query(
      'UPDATE users SET refresh_token = ?, refresh_token_expires_at = ? WHERE id = ?',
      [newRefreshToken, newRefreshExpiresAt, user.id]
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('[AuthController Error (RefreshToken)]:', error);
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.address, u.address_lat, u.address_lng, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('[AuthController Error (GetProfile)]:', error);
    res.status(500).json({ error: 'Unable to fetch profile' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address, address_lat, address_lng } = req.body;

    const [existingUsers] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email is already used by another account' });
    }

    const [currentUsers] = await db.query('SELECT address_lat, address_lng FROM users WHERE id = ?', [req.user.id]);
    const currentUser = currentUsers[0] || {};
    const latitude = address_lat !== undefined ? address_lat : currentUser.address_lat;
    const longitude = address_lng !== undefined ? address_lng : currentUser.address_lng;

    await db.query(
      'UPDATE users SET name = ?, email = ?, phone = ?, address = ?, address_lat = ?, address_lng = ? WHERE id = ?',
      [name, email, phone || null, address || null, latitude || null, longitude || null, req.user.id]
    );

    const [updatedUsers] = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.address, u.address_lat, u.address_lng, r.name AS role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    res.json({ user: updatedUsers[0] });
  } catch (error) {
    console.error('[AuthController Error (UpdateProfile)]:', error);
    res.status(500).json({ error: 'Unable to update profile' });
  }
};

module.exports = {
  register,
  googleAuth,
  login,
  forgotPassword,
  resetPassword,
  refreshToken,
  getProfile,
  updateProfile
};
