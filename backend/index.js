const express = require('express');
const cors = require('cors');
const path = require('path');
const posts = require('./routes/posts');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/posts', posts);

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});