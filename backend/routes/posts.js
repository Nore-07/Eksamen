const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all posts
router.get('/', (req, res) => {
  db.query('SELECT p.*, u.username as author_name FROM posts p JOIN users u ON p.user_id = u.id ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// POST a new post
router.post('/', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { username, message } = req.body;
  const userId = req.user.id;

  // Use the message from body and user from session
  db.query(
    'INSERT INTO posts (message, user_id) VALUES (?, ?)',
    [message, userId],
    (err) => {
      if (err) {
        console.error('MySQL error:', err);
        return res.status(500).json({ error: err });
      }
      res.json({ success: true });
    }
  );
});

// DELETE a post by ID
router.delete('/:id', (req, res) => {
  if (!req.isAuthenticated() || !req.user.is_admin) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const postId = req.params.id;

  db.query('DELETE FROM posts WHERE id = ?', [postId], (err, result) => {
    if (err) {
      console.error('MySQL error:', err);
      return res.status(500).json({ error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ success: true });
  });
});

module.exports = router;