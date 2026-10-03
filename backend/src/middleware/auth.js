const jwt = require('jsonwebtoken');
const db = require('../db');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: 'Authorization token missing' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Access token expired' });
      }
      return res.status(403).json({ error: 'Invalid access token' });
    }

    req.user = user;
    next();
  });
};

const checkRole = (roles) => {
  return async (req, res, next) => {
    try {
      const [rows] = await db.query('SELECT r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.id = ?', [req.user.id]);
      if (rows.length === 0) return res.status(403).json({ error: 'User role not found' });
      
      const userRole = rows[0].role_name;
      if (!roles.includes(userRole)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      req.user.role = userRole;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  };
};

module.exports = { authenticateToken, checkRole };
