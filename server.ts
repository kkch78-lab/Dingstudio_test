import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'server-posts.json');

// Read posts from disk or default
function getStoredPosts() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading server-posts.json:', err);
  }
  return null;
}

// Write posts to disk
function saveStoredPosts(posts: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server-posts.json:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Body parser with high limit for photos and short videos
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // API Routes
  app.get('/api/posts', (_req, res) => {
    const posts = getStoredPosts();
    res.json({ success: true, posts });
  });

  app.post('/api/posts', (req, res) => {
    try {
      const newPost = req.body;
      if (!newPost || !newPost.id) {
        res.status(400).json({ success: false, message: 'Invalid post data' });
        return;
      }
      const existing = getStoredPosts() || [];
      const updated = [newPost, ...existing.filter((p: any) => p.id !== newPost.id)];
      saveStoredPosts(updated);
      res.json({ success: true, post: newPost });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.put('/api/posts/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updatedData = req.body;
      const existing = getStoredPosts() || [];
      const updated = existing.map((p: any) => (p.id === id ? { ...p, ...updatedData } : p));
      saveStoredPosts(updated);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/posts/:id', (req, res) => {
    try {
      const { id } = req.params;
      const existing = getStoredPosts() || [];
      const updated = existing.filter((p: any) => p.id !== id);
      saveStoredPosts(updated);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Serve static files in production or Vite middleware in development
  if (isProd) {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
