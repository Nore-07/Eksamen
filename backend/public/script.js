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
        ${isAdmin ? `<br><button onclick="deletePost(${post.id})">🗑️ Delete</button>` : ''}
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

// Simulated admin flag (set to true for now)
const isAdmin = true;

// Delete post function (admin only)
async function deletePost(id) {
  if (!isAdmin) return;

  if (!confirm('Are you sure you want to delete this post?')) return;

  try {
    const res = await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('Delete failed:', data.error);
      alert('Failed to delete post: ' + (data.error || 'Unknown error'));
      return;
    }

    loadPosts(); // Refresh posts
  } catch (err) {
    console.error('Error during delete:', err);
    alert('Server error while deleting post.');
  }
}


// Load posts when page loads
loadPosts();
