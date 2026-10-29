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

  // Static route for uploaded videos
  const videosDir = path.join(__dirname, 'public', 'videos');
  if (!fs.existsSync(videosDir)) {
    try {
      fs.mkdirSync(videosDir, { recursive: true });
    } catch (e) {
      console.warn('Could not create videos directory:', e);
    }
  }
  app.use('/videos', express.static(videosDir));

  // Static route for uploaded photos/images
  const imagesDir = path.join(__dirname, 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    try {
      fs.mkdirSync(imagesDir, { recursive: true });
    } catch (e) {
      console.warn('Could not create images directory:', e);
    }
  }
  app.use('/images', express.static(imagesDir));

  // Photo Upload API: Saves uploaded photo files to /public/images for fast permanent display across all devices
  app.post('/api/upload-image', (req, res) => {
    try {
      const { fileName, fileData } = req.body;
      if (!fileData) {
        res.status(400).json({ success: false, message: 'No image data provided' });
        return;
      }

      const base64Data = fileData.includes(';base64,')
        ? fileData.split(';base64,')[1]
        : fileData;

      const buffer = Buffer.from(base64Data, 'base64');
      const ext = path.extname(fileName || 'image.jpg') || '.jpg';
      const baseCleanName = path.basename(fileName || 'image', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFileName = `wongok_img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${baseCleanName}${ext}`;
      const filePath = path.join(imagesDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      // Also ensure dist/images has it if running in prod
      const distImagesDir = path.join(__dirname, 'dist', 'images');
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        if (!fs.existsSync(distImagesDir)) {
          fs.mkdirSync(distImagesDir, { recursive: true });
        }
        fs.writeFileSync(path.join(distImagesDir, uniqueFileName), buffer);
      }

      const imageUrl = `/images/${uniqueFileName}`;
      res.json({
        success: true,
        imageUrl,
        fileName: uniqueFileName,
        size: buffer.length
      });
    } catch (err: any) {
      console.error('Error saving image:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Video Upload API: Saves uploaded video files to /public/videos for fast permanent streaming across all devices
  app.post('/api/upload-video', (req, res) => {
    try {
      const { fileName, fileData } = req.body;
      if (!fileData) {
        res.status(400).json({ success: false, message: 'No video data provided' });
        return;
      }

      // Extract base64 payload from data URL if present
      const base64Data = fileData.includes(';base64,')
        ? fileData.split(';base64,')[1]
        : fileData;

      const buffer = Buffer.from(base64Data, 'base64');
      const ext = path.extname(fileName || 'video.mp4') || '.mp4';
      const baseCleanName = path.basename(fileName || 'video', ext).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFileName = `wongok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${baseCleanName}${ext}`;
      const filePath = path.join(videosDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

      // Also ensure dist/videos has it if running in prod
      const distVideosDir = path.join(__dirname, 'dist', 'videos');
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        if (!fs.existsSync(distVideosDir)) {
          fs.mkdirSync(distVideosDir, { recursive: true });
        }
        fs.writeFileSync(path.join(distVideosDir, uniqueFileName), buffer);
      }

      const videoUrl = `/videos/${uniqueFileName}`;
      res.json({
        success: true,
        videoUrl,
        fileName: uniqueFileName,
        size: buffer.length
      });
    } catch (err: any) {
      console.error('Error saving video:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // API Routes
  app.get('/api/posts', (_req, res) => {
    const posts = getStoredPosts() || [];
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
