import express from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'server-posts.json');
const DELETED_DATA_FILE = path.join(__dirname, 'server-deleted-posts.json');

// Read set of permanently deleted post IDs
function getDeletedPostIds(): Set<string> {
  try {
    if (fs.existsSync(DELETED_DATA_FILE)) {
      const content = fs.readFileSync(DELETED_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (err) {
    console.error('Error reading server-deleted-posts.json:', err);
  }
  return new Set();
}

// Save set of permanently deleted post IDs
function saveDeletedPostIds(ids: Set<string>) {
  try {
    fs.writeFileSync(DELETED_DATA_FILE, JSON.stringify(Array.from(ids), null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving server-deleted-posts.json:', err);
  }
}

// Read posts from disk or default
function getStoredPosts() {
  try {
    const deletedIds = getDeletedPostIds();
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((p: any) => !p.isDeleted && !deletedIds.has(p.id))
          .map((p: any) => {
            let ts = typeof p.lastUpdated === 'number' && !isNaN(p.lastUpdated) && p.lastUpdated > 0 ? p.lastUpdated : 0;
            if (!ts && p.id && typeof p.id === 'string') {
              const m = p.id.match(/^post_(\d{10,13})/);
              if (m) ts = parseInt(m[1], 10);
            }
            if (!ts && p.date) {
              const d = new Date(p.date).getTime();
              if (!isNaN(d) && d > 0) ts = d;
            }
            if (!ts) ts = Date.now();
            return { ...p, lastUpdated: ts };
          });
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error reading server-posts.json:', err);
  }
  return null;
}

// Write posts to disk
function saveStoredPosts(posts: any[]) {
  try {
    const deletedIds = getDeletedPostIds();
    const cleanPosts = posts.filter((p: any) => !p.isDeleted && !deletedIds.has(p.id));
    fs.writeFileSync(DATA_FILE, JSON.stringify(cleanPosts, null, 2), 'utf-8');
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
  app.use('/api/posts/:id/video', express.raw({ type: '*/*', limit: '100mb' }));

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
          // If file is not found, return 404 cleanly so UI knows it needs sync, never hijack with wrong video
          res.status(404).json({ success: false, message: `Video not found on server: ${filename}` });
          return;
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
  app.post('/api/upload-video-raw', (req, res) => {
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

      // Also save with exact clean fileName so direct links and legacy references resolve
      if (fileName && fileName !== 'video.mp4') {
        try {
          fs.writeFileSync(path.join(videosDir, fileName), buffer);
        } catch (e) {}
      }

      const distVideosDir = path.join(__dirname, 'dist', 'videos');
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        if (!fs.existsSync(distVideosDir)) {
          fs.mkdirSync(distVideosDir, { recursive: true });
        }
        fs.writeFileSync(path.join(distVideosDir, uniqueFileName), buffer);
        if (fileName && fileName !== 'video.mp4') {
          try {
            fs.writeFileSync(path.join(distVideosDir, fileName), buffer);
          } catch (e) {}
        }
      }

      const videoUrl = `/videos/${uniqueFileName}`;
      res.json({
        success: true,
        videoUrl,
        fileName: uniqueFileName,
        originalName: fileName,
        size: buffer.length
      });
    } catch (err: any) {
      console.error('Error in raw video upload:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Direct Binary Video Upload & Sync for a Specific Post ID
  app.post('/api/posts/:id/video', (req, res) => {
    try {
      const { id } = req.params;
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

      if (fileName && fileName !== 'video.mp4') {
        try {
          fs.writeFileSync(path.join(videosDir, fileName), buffer);
        } catch (e) {}
      }

      const distVideosDir = path.join(__dirname, 'dist', 'videos');
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        if (!fs.existsSync(distVideosDir)) {
          fs.mkdirSync(distVideosDir, { recursive: true });
        }
        fs.writeFileSync(path.join(distVideosDir, uniqueFileName), buffer);
        if (fileName && fileName !== 'video.mp4') {
          try {
            fs.writeFileSync(path.join(distVideosDir, fileName), buffer);
          } catch (e) {}
        }
      }

      const videoUrl = `/videos/${uniqueFileName}`;
      const now = Date.now();

      // Update server-posts.json immediately
      const existingList = getStoredPosts() || [];
      const updated = existingList.map((p: any) => {
        if (p.id === id) {
          return {
            ...p,
            videoUrl,
            videoFileName: fileName,
            videoFileSize: buffer.length,
            videoSourceType: 'file',
            hasStoredVideo: true,
            lastUpdated: now
          };
        }
        return p;
      });
      saveStoredPosts(updated);

      res.json({
        success: true,
        videoUrl,
        fileName,
        size: buffer.length,
        lastUpdated: now
      });
    } catch (err: any) {
      console.error('Error in post video sync upload:', err);
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
    const deletedIds = Array.from(getDeletedPostIds());
    const posts = (getStoredPosts() || []).filter((p: any) => !p.isDeleted && !deletedIds.includes(p.id));
    res.json({ success: true, posts, deletedIds });
  });

  app.post('/api/posts', (req, res) => {
    try {
      const newPost = req.body;
      if (!newPost || !newPost.id) {
        res.status(400).json({ success: false, message: 'Invalid post data' });
        return;
      }

      // Check if post is marked as deleted or already deleted
      const deletedIds = getDeletedPostIds();
      if (newPost.isDeleted) {
        deletedIds.add(newPost.id);
        saveDeletedPostIds(deletedIds);
        const existingList = getStoredPosts() || [];
        saveStoredPosts(existingList.filter((p: any) => p.id !== newPost.id));
        res.json({ success: true, isDeleted: true });
        return;
      }

      if (deletedIds.has(newPost.id)) {
        res.status(403).json({ success: false, message: 'This post has been permanently deleted by an administrator.' });
        return;
      }

      const incomingTs = typeof newPost.lastUpdated === 'number' && !isNaN(newPost.lastUpdated) && newPost.lastUpdated > 0
        ? newPost.lastUpdated
        : Date.now();
      newPost.lastUpdated = incomingTs;

      const existingList = getStoredPosts() || [];
      const existingIdx = existingList.findIndex((p: any) => p.id === newPost.id);

      let updated: any[];
      if (existingIdx >= 0) {
        const existingPost = existingList[existingIdx];
        const existingTs = typeof existingPost.lastUpdated === 'number' && !isNaN(existingPost.lastUpdated)
          ? existingPost.lastUpdated
          : 0;

        if (incomingTs >= existingTs) {
          const mergedPost = {
            ...existingPost,
            ...newPost,
            imageUrl: newPost.imageUrl || existingPost.imageUrl,
            videoUrl: newPost.videoUrl || existingPost.videoUrl,
            videoData: newPost.videoData || existingPost.videoData,
            views: Math.max(existingPost.views || 0, newPost.views || 0),
            lastUpdated: incomingTs
          };
          updated = existingList.map((p: any, idx: number) => (idx === existingIdx ? mergedPost : p));
        } else {
          const mergedPost = {
            ...newPost,
            ...existingPost,
            imageUrl: existingPost.imageUrl || newPost.imageUrl,
            videoUrl: existingPost.videoUrl || newPost.videoUrl,
            videoData: existingPost.videoData || newPost.videoData,
            views: Math.max(existingPost.views || 0, newPost.views || 0),
            lastUpdated: existingTs
          };
          updated = existingList.map((p: any, idx: number) => (idx === existingIdx ? mergedPost : p));
        }
      } else {
        updated = [newPost, ...existingList];
      }

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

      // Handle soft delete through PUT
      if (updatedData.isDeleted) {
        const deletedIds = getDeletedPostIds();
        deletedIds.add(id);
        saveDeletedPostIds(deletedIds);
        const existingList = getStoredPosts() || [];
        saveStoredPosts(existingList.filter((p: any) => p.id !== id));
        res.json({ success: true, deleted: true });
        return;
      }

      const incomingTs = typeof updatedData.lastUpdated === 'number' && !isNaN(updatedData.lastUpdated) && updatedData.lastUpdated > 0
        ? updatedData.lastUpdated
        : Date.now();
      updatedData.lastUpdated = incomingTs;

      const existingList = getStoredPosts() || [];
      let found = false;
      const updated = existingList.map((p: any) => {
        if (p.id === id) {
          found = true;
          const existingTs = typeof p.lastUpdated === 'number' && !isNaN(p.lastUpdated) ? p.lastUpdated : 0;
          if (incomingTs >= existingTs) {
            return {
              ...p,
              ...updatedData,
              imageUrl: updatedData.imageUrl || p.imageUrl,
              videoUrl: updatedData.videoUrl || p.videoUrl,
              videoData: updatedData.videoData || p.videoData,
              views: updatedData.views !== undefined ? Math.max(p.views || 0, updatedData.views) : p.views,
              lastUpdated: incomingTs
            };
          } else {
            return {
              ...updatedData,
              ...p,
              imageUrl: p.imageUrl || updatedData.imageUrl,
              videoUrl: p.videoUrl || updatedData.videoUrl,
              videoData: p.videoData || updatedData.videoData,
              views: Math.max(p.views || 0, updatedData.views || 0),
              lastUpdated: existingTs
            };
          }
        }
        return p;
      });

      if (!found) {
        updated.push({ id, ...updatedData, lastUpdated: incomingTs });
      }

      saveStoredPosts(updated);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.delete('/api/posts/:id', (req, res) => {
    try {
      const { id } = req.params;
      const deletedIds = getDeletedPostIds();
      deletedIds.add(id);
      saveDeletedPostIds(deletedIds);

      const existing = getStoredPosts() || [];
      const updated = existing.filter((p: any) => p.id !== id);
      saveStoredPosts(updated);
      res.json({ success: true, deletedId: id, deletedIds: Array.from(deletedIds) });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Endpoints for syncing deleted post IDs
  app.get('/api/deleted-posts', (_req, res) => {
    res.json({ success: true, deletedIds: Array.from(getDeletedPostIds()) });
  });

  app.post('/api/deleted-posts', (req, res) => {
    try {
      const { id, ids } = req.body;
      const deletedIds = getDeletedPostIds();
      if (id && typeof id === 'string') deletedIds.add(id);
      if (Array.isArray(ids)) {
        ids.forEach((i: any) => {
          if (typeof i === 'string') deletedIds.add(i);
        });
      }
      saveDeletedPostIds(deletedIds);
      const existing = getStoredPosts() || [];
      const updated = existing.filter((p: any) => !deletedIds.has(p.id));
      saveStoredPosts(updated);
      res.json({ success: true, deletedIds: Array.from(deletedIds) });
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
