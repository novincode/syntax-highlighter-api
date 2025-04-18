# Syntax Highlighter API

A blazing-fast, open source microservice for syntax highlighting code snippets using [Shiki](https://github.com/shikijs/shiki) and [Express](https://expressjs.com/).

---

## 🚀 Why?

Ever wanted to use Shiki or rehype for syntax highlighting, but hit a wall because your environment (like edge/serverless) doesn't support Node.js `fs`? That's exactly why this project exists! I needed a simple, reliable API to highlight code for my own edge project—so I built this, and now it's open source for everyone.

## ✨ What does it do?

- Accepts raw code, language, and theme via a simple API
- Returns beautiful, ready-to-serve HTML with syntax highlighting
- Powered by Shiki for accurate, fast, and themeable results
- Perfect for edge, serverless, or frontend-only projects that can't run Shiki directly

## 🛠️ Usage

1. **Clone & Install**
   ```bash
   git clone https://github.com/novincode/syntax-highlighter-api.git
   cd syntax-highlighter-api
   pnpm install
   # or npm install
   ```

2. **Configure**
   Copy `.env.example` to `.env` and set your API key:
   ```bash
   cp .env.example .env
   # Edit .env and set API_KEY
   ```

3. **Run**
   ```bash
   pnpm dev
   # or npm run dev
   ```

4. **Highlight!**
   Send a POST request to `/highlight`:
   ```json
   POST /highlight
   Headers: { "x-api-key": "your_api_key" }
   Body: {
     "code": "console.log('Hello, world!')",
     "lang": "js",
     "theme": "github-dark"
   }
   ```
   Response:
   ```json
   { "html": "<pre class=...>...</pre>" }
   ```

## 🌍 Deploy Anywhere
- Works great on any Node.js host
- Ideal for Vercel, Netlify, Fly.io, or your own server

## 🤝 Contributing
PRs, issues, and ideas are welcome! If this project solves your problem, star it and share it. If you want a feature, open an issue or PR!

## 📄 License
MIT

---

> Built to solve my own edge/serverless syntax highlighting problem. Hope it helps you too!