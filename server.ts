import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'app-data.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface AppData {
  platforms: any[];
  videos: any[];
  hypeCount: number;
  updatedAt: string;
}

function loadData(): AppData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      if (parsed && Array.isArray(parsed.platforms) && Array.isArray(parsed.videos)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading app-data.json:', err);
  }

  return {
    platforms: [],
    videos: [],
    hypeCount: 0,
    updatedAt: new Date().toISOString()
  };
}

function saveData(data: AppData): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing app-data.json:', err);
    return false;
  }
}

// In-memory persistent cache loaded from disk
let currentStore: AppData = loadData();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Route: GET /api/data (Fetch live online platforms, follower counts & videos)
  app.get('/api/data', (_req, res) => {
    // Re-read file if in-memory store is empty
    if (!currentStore.platforms.length) {
      currentStore = loadData();
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({
      success: true,
      data: currentStore
    });
  });

  // API Route: POST /api/data (Save updated numbers, videos, or hype from Admin)
  app.post('/api/data', (req, res) => {
    try {
      const { platforms, videos, hypeCount, password } = req.body;

      // Optional authorization check: If password is provided, enforce valid admin credential
      if (password && password !== 'mrmla9') {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: Invalid admin credentials'
        });
      }

      currentStore = {
        platforms: Array.isArray(platforms) ? platforms : currentStore.platforms,
        videos: Array.isArray(videos) ? videos : currentStore.videos,
        hypeCount: typeof hypeCount === 'number' ? hypeCount : currentStore.hypeCount,
        updatedAt: new Date().toISOString()
      };

      const saved = saveData(currentStore);
      if (!saved) {
        return res.status(500).json({ success: false, error: 'Failed to write to persistent storage' });
      }

      console.log(`[Online Sync] Admin saved data at ${currentStore.updatedAt}: ${currentStore.platforms.length} platforms, ${currentStore.videos.length} videos`);

      return res.json({
        success: true,
        message: 'Data successfully synchronized online',
        data: currentStore
      });
    } catch (err: any) {
      console.error('API Error in POST /api/data:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Server error saving online data'
      });
    }
  });

  // API Route: Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
