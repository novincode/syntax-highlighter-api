import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import { CodeToHastOptions, ShikiTransformer, ThemedToken, createHighlighter } from 'shiki';

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

// Types for the request body
interface HighlightRequestBody {
  code: string;
  lang: string;
  theme?: string;
  highlightLines?: number[];
  showLineNumbers?: boolean;
  focusLines?: number[];
  annotations?: Array<{
    line: number;
    message: string;
    style?: string;
  }>;
  wordsToHighlight?: string[];
}

// POST /highlight endpoint
app.post('/highlight', apiKeyAuth, async (req: Request<{}, {}, HighlightRequestBody>, res: Response) => {
  const { code, lang, theme, highlightLines, showLineNumbers, focusLines, annotations, wordsToHighlight } = req.body;

  if (typeof code !== 'string' || typeof lang !== 'string') {
    res.status(400).json({ error: 'Missing or invalid code/lang' });
    return;
  }

  try {
    // Trim code to remove empty lines at the beginning and end
    const trimmedCode = code.replace(/^\s*\n|\n\s*$/g, '');

    const highlighter = await createHighlighter({
      themes: [theme || 'github-dark'],
      langs: [lang],
    });

    // Determine if the theme is dark or light
    const selectedTheme = theme || 'github-dark';
    const isDarkTheme = selectedTheme.includes('dark') ||
      selectedTheme.includes('night') ||
      selectedTheme.includes('black') ||
      selectedTheme === 'dracula' ||
      selectedTheme === 'nord';

    // Convert annotations to a map for easy lookup
    const annotationMap: Record<number, { message: string, style?: string }> = {};
    if (Array.isArray(annotations)) {
      annotations.forEach((ann) => {
        if (ann && typeof ann.line === 'number' && ann.message) {
          // Make sure the style is one of our supported types or undefined
          const style = ['info', 'warning', 'error'].includes(ann.style || '') ? ann.style : undefined;
          annotationMap[ann.line] = { message: ann.message, style };
        }
      });
    }

    // Words to highlight - convert to lowercase for case-insensitive matching
    const wordsToHighlightMap = wordsToHighlight?.map(i => i.toLowerCase()) || []
    // Create transformers with improved implementation
    const transformers: ShikiTransformer[] = [
      {
        name: 'custom-transformer',

        // Process each line to add line numbers, highlighting, focus, and annotations
        line(hast, lineNumber) {
          // Add specific line classes based on configuration
          if (Array.isArray(highlightLines) && highlightLines.includes(lineNumber)) {
            this.addClassToHast(hast, 'highlighted-line');
          }

          if (Array.isArray(focusLines) && focusLines.includes(lineNumber)) {
            this.addClassToHast(hast, 'focus-line');
          }

          // Add line numbers if requested
          if (showLineNumbers) {
            hast.children.unshift({
              type: 'element',
              tagName: 'span',
              properties: { class: 'line-number' },
              children: [{ type: 'text', value: String(lineNumber) }]
            });
          }

          // Add annotations if present for this line
          const ann = annotationMap[lineNumber];
          if (ann) {
            hast.children.push({
              type: 'element',
              tagName: 'span',
              properties: {
                class: `annotation${ann.style ? ` annotation-${ann.style}` : ''}`
              },
              children: [{ type: 'text', value: ann.message }]
            });
          }

          return hast;
        },
        
        // Process each token span to highlight specific words
        span(hast, line, column, lineElement, token) {
          // Check if the token content (case-insensitive) matches any word to highlight
          if (wordsToHighlightMap.length > 0) {
            const tokenLower = token.content.toLowerCase().trim();
            // Check for exact word matches with word boundaries
            if (wordsToHighlightMap.includes(tokenLower)) {
              this.addClassToHast(hast, 'word-highlight');
            }
          }
          return hast;
        },
      }
    ];

    // Generate HTML using Shiki's transformer API
    let html = highlighter.codeToHtml(trimmedCode, {
      lang,
      theme: theme || 'github-dark',
      transformers
    });

    const styles = `
      /* Base styles that work with both themes */
      .shiki .line { display: block; }
      .shiki code { display: flex; flex-direction: column; }
      
      /* Theme specific styles */
      ${isDarkTheme ? `
        /* Dark theme */
        .highlighted-line { background-color: rgba(255, 255, 0, 0.15); border-left: 3px solid rgba(255, 255, 0, 0.5); }
        .focus-line { background-color: rgba(58, 130, 247, 0.15); border-left: 3px solid rgba(58, 130, 247, 0.5); }
        .line-number { color: rgba(255, 255, 255, 0.5); font-size: 0.8em; margin-right: 10px; }
        .annotation { color: rgba(255, 255, 255, 0.7); font-style: italic; margin-left: 8px; padding: 0 4px; }
        .annotation-info { background-color: rgba(58, 130, 247, 0.6); color: #fff; padding: 2px 4px; border-radius: 3px; }
        .annotation-warning { background-color: rgba(255, 152, 0, 0.6); color: #fff; padding: 2px 4px; border-radius: 3px; }
        .annotation-error { background-color: rgba(244, 67, 54, 0.6); color: #fff; padding: 2px 4px; border-radius: 3px; }
        .word-highlight {
          background: rgba(120,130,150,0.22);
          color: #fff;
          border-radius: 4px;
          padding: 1px 4px;
          font-weight: 500;
          box-shadow: 0 1px 2px 0 rgba(0,0,0,0.04);
          transition: background 0.2s;
        }
      ` : `
        /* Light theme */
        .highlighted-line { background-color: rgba(255, 213, 0, 0.1); border-left: 3px solid rgba(255, 213, 0, 0.7); }
        .focus-line { background-color: rgba(33, 150, 243, 0.1); border-left: 3px solid rgba(33, 150, 243, 0.7); }
        .line-number { color: rgba(0, 0, 0, 0.5); font-size: 0.8em; margin-right: 10px; }
        .annotation { color: rgba(0, 0, 0, 0.7); font-style: italic; margin-left: 8px; padding: 0 4px; }
        .annotation-info { background-color: rgba(33, 150, 243, 0.15); color: #0d47a1; padding: 2px 4px; border-radius: 3px; }
        .annotation-warning { background-color: rgba(255, 152, 0, 0.15); color: #e65100; padding: 2px 4px; border-radius: 3px; }
        .annotation-error { background-color: rgba(244, 67, 54, 0.15); color: #b71c1c; padding: 2px 4px; border-radius: 3px; }
        .word-highlight {
          background: rgba(120,130,150,0.13);
          color: #222;
          border-radius: 4px;
          padding: 1px 4px;
          font-weight: 500;
          box-shadow: 0 1px 2px 0 rgba(0,0,0,0.03);
          transition: background 0.2s;
        }
      `}
    `;

    if (html.includes('<style>')) {
      // If the HTML already contains a <style> tag, append styles to it
      html = html.replace(/<style>([\s\S]*?)<\/style>/, (match, p1) => {
        return `<style>${p1}${styles}</style>`;
      });
    } else {
      html = `<style>${styles}</style>` + html;
    }

    if (LOGGER) {
      console.log('Highlight request:', {
        lang,
        theme,
        code: code.slice(0, 30) + (code.length > 30 ? '...' : ''),
        highlightLines,
        showLineNumbers,
        focusLines,
        annotations,
        wordsToHighlight
      });
      console.log('Response HTML length:', html.length);
    }

    res.json({ html });
  } catch (err) {
    res.status(500).json({
      error: 'Highlighting failed',
      details: (err instanceof Error ? err.message : String(err))
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Syntax Highlighter API running on port ${PORT}`);
});
