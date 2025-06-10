const express = require('express');
const router = express.Router();
const pool = require('../../config/db');
const jwt = require('jsonwebtoken');

// Replace with your own secure secret key
const JWT_SECRET = 'your_jwt_secret_key';

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM pp.user WHERE user_name = $1 AND locked_yn != $2',
      [email, 'Y']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or account locked' });
    }

    const user = result.rows[0];

    if (password !== user.enc_password) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, user_name: user.user_name },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
