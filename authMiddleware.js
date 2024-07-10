const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No Authorization header provided.' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Access denied. Authorization header format is "Bearer <token>".' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, 'your-secret-key'); // Replace 'your-secret-key' with your actual secret key
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = authenticateToken;
