import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sessionRoutes from './routes/session';
import trackingRoutes from './routes/tracking';
import adminRoutes from './routes/admin';
import { redis } from './services/redis';
import { trackingLimiter } from './middleware/rateLimit';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Intentionally open CORS — this is an educational project.
// Students should not have to deal with CORS configuration.
app.use(cors());
app.use(express.json());

app.use('/api/session', sessionRoutes);
app.use('/api/track', trackingLimiter, trackingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    await redis.ping();
    res.json({ status: 'ok', redis: 'connected' });
  } catch {
    res.status(500).json({ status: 'error', redis: 'disconnected' });
  }
});

// Serve frontend in production
const distPath = path.resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));

const PORT = parseInt(process.env.PORT || '3001');
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[AIPL Server] Running on http://0.0.0.0:${PORT}`);
});
