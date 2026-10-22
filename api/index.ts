import express, { Request, Response } from 'express';
import {
  handleGeneratePlan,
  handleAiSuggest,
  checkHealth,
  applyRateLimit,
} from '../server/celebrationCore';

const app = express();
app.use(express.json({ limit: '5mb' }));

// Middleware for rate-limiting
app.use((req: Request, res: Response, next) => {
  const clientIp =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';

  if (req.path.startsWith('/api') || req.path.startsWith('/generate-plan') || req.path.startsWith('/ai-suggest')) {
    if (!applyRateLimit(clientIp)) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }
  }
  next();
});

// Handlers supporting both with /api and without /api prefixes
const generatePlanHandler = async (req: Request, res: Response) => {
  try {
    const result = await handleGeneratePlan(req.body);
    if (!result.success) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json(result.data);
  } catch (error: any) {
    console.error('Express generate-plan error:', error);
    return res.status(500).json({ error: 'Failed to process celebration plan.' });
  }
};

const aiSuggestHandler = async (req: Request, res: Response) => {
  try {
    const result = await handleAiSuggest(req.body);
    if (!result.success) {
      return res.status(result.status || 400).json({ error: result.error });
    }
    return res.status(200).json({ advice: result.advice });
  } catch (error: any) {
    console.error('Express ai-suggest error:', error);
    return res.status(500).json({ error: 'Failed to process advice.' });
  }
};

const healthHandler = (_req: Request, res: Response) => {
  res.status(200).json(checkHealth());
};

app.post('/api/generate-plan', generatePlanHandler);
app.post('/generate-plan', generatePlanHandler);

app.post('/api/ai-suggest', aiSuggestHandler);
app.post('/ai-suggest', aiSuggestHandler);

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

export default app;
