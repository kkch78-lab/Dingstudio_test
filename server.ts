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

  // Direct Raw Binary Video Upload middleware (must be before urlencoded/json)
  app.use('/api/upload-video-raw', express.raw({ type: '*/*', limit: '100mb' }));

  // Body parser with high limit for photos and short videos
  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true, limit: '100mb' }));

  // Static and Streaming routes for uploaded videos
  const videosDir = path.join(__dirname, 'public', 'videos');
  if (!fs.existsSync(videosDir)) {
    try {
      fs.mkdirSync(videosDir, { recursive: true });
    } catch (e) {
      console.warn('Could not create videos directory:', e);
    }
  }

  // Resilient Video Streaming Route with Range Request (HTTP 206) support for iOS Safari, Android Chrome & KakaoTalk
  app.get('/videos/:filename', (req, res, next) => {
    try {
      const filename = path.basename(req.params.filename);
      let filePath = path.join(videosDir, filename);

      if (!fs.existsSync(filePath)) {
        // Check dist/videos if in production
        const distFilePath = path.join(__dirname, 'dist', 'videos', filename);
        if (fs.existsSync(distFilePath)) {
          filePath = distFilePath;
        } else {
          // Resilient fallback to default sports clip so video player never gets a 404 broken screen
          const fallbackPath = path.join(videosDir, 'wongok_reels_jump_shot.mp4');
          if (fs.existsSync(fallbackPath)) {
            filePath = fallbackPath;
          } else {
            return next();
          }
        }
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      // Determine optimal MIME type: serve MOV/M4V as video/mp4 for cross-browser hardware playback
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'video/mp4';
      if (ext === '.webm') contentType = 'video/webm';
      else if (ext === '.ogg') contentType = 'video/ogg';
      else if (ext === '.3gp') contentType = 'video/3gpp';
      else if (ext === '.mov' || ext === '.m4v' || ext === '.mp4') contentType = 'video/mp4';

      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
          res.status(416).send(`Requested range not satisfiable: ${start} >= ${fileSize}`);
          return;
        }

        const chunkSize = end - start + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
        });
        fileStream.pipe(res);
      } else {
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType,
          'Accept-Ranges': 'bytes',
        });
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (streamErr) {
      console.error('Video streaming error:', streamErr);
      next();
    }
  });

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

  // Direct Binary Video Upload API: Zero base64 encoding overhead for phone cameras & KakaoTalk MP4s
  app.post('/api/upload-video-raw', express.raw({ type: '*/*', limit: '100mb' }), (req, res) => {
    try {
      const rawHeaderName = req.headers['x-file-name'] as string;
      const fileName = rawHeaderName ? decodeURIComponent(rawHeaderName) : 'video.mp4';
      const buffer = req.body as Buffer;

      if (!buffer || buffer.length === 0) {
        res.status(400).json({ success: false, message: 'Empty video buffer' });
        return;
      }

      let rawExt = path.extname(fileName || '').toLowerCase();
      if (!rawExt) rawExt = '.mp4';

      const baseCleanName = path.basename(fileName || 'video', rawExt).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFileName = `wongok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${baseCleanName || 'clip'}${rawExt}`;
      const filePath = path.join(videosDir, uniqueFileName);

      fs.writeFileSync(filePath, buffer);

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
      console.error('Error in raw video upload:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Base64 Video Upload API (Fallback)
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
      
      // Smart extension resolution (supports KakaoTalk files and smartphone camera files)
      let rawExt = path.extname(fileName || '').toLowerCase();
      if (!rawExt) {
        if (fileData.includes('video/mp4')) rawExt = '.mp4';
        else if (fileData.includes('video/quicktime')) rawExt = '.mov';
        else if (fileData.includes('video/webm')) rawExt = '.webm';
        else if (fileData.includes('video/3gpp')) rawExt = '.3gp';
        else rawExt = '.mp4';
      }

      const baseCleanName = path.basename(fileName || 'video', rawExt).replace(/[^a-zA-Z0-9_-]/g, '_');
      const uniqueFileName = `wongok_${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${baseCleanName || 'clip'}${rawExt}`;
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
