import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { createHighlighter } from 'shiki';

// Load environment variables from .env
dotenv.config();

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY;
const LOGGER = process.env.LOGGER === 'true';

// API key middleware
function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const key = req.header('x-api-key');
  if (!API_KEY || key !== API_KEY) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  next();
}

if (LOGGER) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// POST /highlight endpoint
app.post('/highlight', apiKeyAuth, async (req: Request, res: Response) => {
  const { code, lang, theme } = req.body;
  if (typeof code !== 'string' || typeof lang !== 'string') {
    res.status(400).json({ error: 'Missing or invalid code/lang' });
    return;
  }
  try {
    const highlighter = await createHighlighter({
      themes: [theme || 'github-dark'],
      langs: [lang],
    });
    const html = highlighter.codeToHtml(code, { lang, theme: theme || 'github-dark' });
    if (LOGGER) {
      console.log('Highlight request:', { lang, theme, code: code.slice(0, 30) + (code.length > 30 ? '...' : '') });
      console.log('Response HTML length:', html.length);
    }
    res.json({ html });
  } catch (err) {
    res.status(500).json({ error: 'Highlighting failed', details: (err instanceof Error ? err.message : String(err)) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Syntax Highlighter API running on port ${PORT}`);
});
