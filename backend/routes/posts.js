const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM posts ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

router.post('/', (req, res) => {
    const { username, message } = req.body;
    console.log('Received post request:', username, message); // Log the input
  
    db.query(
      'INSERT INTO posts (username, message) VALUES (?, ?)',
      [username, message],
      (err) => {
        if (err) {
          console.error('MySQL error:', err); // Log any MySQL errors
          return res.status(500).json({ error: err });
        }
        res.json({ success: true });
      }
    );
  });

module.exports = router;