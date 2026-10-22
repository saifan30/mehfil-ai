import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  handleGeneratePlan,
  handleAiSuggest,
  checkHealth,
  applyRateLimit,
} from './server/celebrationCore';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

function getCliArg(flag: string): string | undefined {
  const index = process.argv.indexOf(flag);
  if (index !== -1 && index + 1 < process.argv.length) {
    return process.argv[index + 1];
  }
  return undefined;
}

const cliPort = getCliArg('--port') || getCliArg('-p');
const PORT = Number(process.env.PORT || cliPort || 3000);
const cliHost = getCliArg('--host') || getCliArg('-h');
const HOST = process.env.HOST || cliHost || '0.0.0.0';

app.use(express.json({ limit: '5mb' }));

// Rate-limiting middleware
app.use('/api', (req: Request, res: Response, next) => {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket.remoteAddress ||
    'unknown';
  if (!applyRateLimit(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
  }
  next();
});

// API: Generate Event Plan
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  try {
    const result = await handleGeneratePlan(req.body);
    if (!result.success) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json(result.data);
  } catch (error: any) {
    console.error('Error generating event plan:', error);
    return res.status(500).json({ error: 'Failed to generate event plan.' });
  }
});

// API: AI Suggestions
app.post('/api/ai-suggest', async (req: Request, res: Response) => {
  try {
    const result = await handleAiSuggest(req.body);
    if (!result.success) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json({ advice: result.advice });
  } catch (error: any) {
    console.error('Error in AI suggestion:', error);
    return res.status(500).json({ error: 'Failed to generate suggestion.' });
  }
});

// API: Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json(checkHealth());
});

// Dev vs Prod Vite Integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`Mehfil AI server is running on http://${HOST}:${PORT}`);
  });
}

startServer();
