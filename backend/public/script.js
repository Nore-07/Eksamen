// Fetch and display all posts
async function loadPosts() {
    try {
      const res = await fetch('/api/posts');
      const posts = await res.json();
  
      const container = document.getElementById('posts');
      container.innerHTML = '';
  
      if (posts.length === 0) {
        container.innerHTML = '<p>No posts yet.</p>';
        return;
      }
  
      posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post';
        div.innerHTML = `
          <strong>${sanitize(post.username)}</strong><br>
          ${sanitize(post.message).replace(/\n/g, '<br>')}
          <br><small>${new Date(post.created_at).toLocaleString()}</small>
        `;
        container.appendChild(div);
      });
    } catch (err) {
      document.getElementById('posts').innerHTML = 'Error loading posts.';
      console.error(err);
    }
  }
  
  // Handle form submission
  document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const username = document.getElementById('username').value.trim();
    const message = document.getElementById('message').value.trim();
  
    if (!username || !message) {
      alert('Please fill in both fields.');
      return;
    }
  
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, message })
      });
  
      if (res.ok) {
        document.getElementById('message').value = '';
        loadPosts(); // Refresh posts after submission
      } else {
        alert('Failed to post. Please try again.');
      }
    } catch (err) {
      alert('Server error.');
      console.error(err);
    }
  });
  
  // Prevent XSS: escape HTML
  function sanitize(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  
  // Load posts when page loads
  loadPosts();
  