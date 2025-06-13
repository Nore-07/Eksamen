const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./db');
const posts = require('./routes/posts');

const app = express();

// Session setup
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport config
passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) return done(err);
    if (results.length === 0) return done(null, false, { message: 'Incorrect username.' });

    const user = results[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) return done(null, false, { message: 'Incorrect password.' });

    return done(null, user);
  });
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    done(err, results[0]);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Auth routes
app.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ success: true, user: req.user });
});

app.post('/register', async (req, res) => {
  const { username, password, isAdmin } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (username, password_hash, is_admin) VALUES (?, ?, ?)',
      [username, hashedPassword, isAdmin || false],
      (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

app.get('/logout', (req, res) => {
  req.logout(() => {});
  res.json({ success: true });
});

app.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Keep your existing routes
app.use('/api/posts', posts);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});