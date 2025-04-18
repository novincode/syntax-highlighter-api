# ✨ Syntax Highlighter API 🚦

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/novincode/syntax-highlighter-api?style=social)](https://github.com/novincode/syntax-highlighter-api/stargazers)
![express](https://img.shields.io/badge/express-5.1.0-blue?logo=express)
![shiki](https://img.shields.io/badge/shiki-3.2.2-purple?logo=shikijs)

A blazing-fast ⚡️, open source microservice for syntax highlighting code snippets using [Shiki](https://github.com/shikijs/shiki) 🎨 and [Express](https://expressjs.com/) 🚀.

---

## 🚀 Why Syntax Highlighter API? 🤔

Tired of fighting with environments (like edge/serverless) that don't support Node.js `fs`? 😩 Want to use Shiki or rehype for beautiful syntax highlighting, but can't run them directly? 🎨✨ This API is for you! I built it to solve my own edge deployment headaches, and now it's open source for everyone. 🌍

## ✨ Features

- **Simple API:** Send code, language, and theme—get back gorgeous HTML. 💅
- **Powered by Shiki:** Fast, accurate, and themeable syntax highlighting. 🖌️
- **Edge/Serverless Ready:** Offload highlighting to this API from any frontend or serverless app. ☁️
- **Open Source & Fast:** Lightweight, MIT-licensed, and easy to self-host. 🚀

## 🛠️ Quick Start

### 1. Clone & Install 📦
```bash
git clone https://github.com/novincode/syntax-highlighter-api.git
cd syntax-highlighter-api
pnpm install
# or npm install
```

### 2. Configure ⚙️
Copy `.env.example` to `.env` and set your API key:
```bash
cp .env.example .env
# Edit .env and set API_KEY
```

### 3. Run the Server 🏃‍♂️
```bash
pnpm dev
# or npm run dev
```

### 4. Highlight Code via API ✍️
Send a POST request to `/highlight`:

```
POST /highlight
Headers:
  x-api-key: your_api_key
  Content-Type: application/json

Body:
{
  "code": "console.log('Hello, world!')",
  "lang": "js",
  "theme": "github-dark"
}
```

**Response:**
```json
{
  "html": "<pre class=...>...</pre>"
}
```

---

## 🌍 Deploy Anywhere 🚢
- Works on any Node.js host
- Perfect for Vercel, Netlify, Fly.io, or your own server

## 🤝 Contributing

Pull requests, issues, and ideas are welcome! 🙏 If this project helps you, ⭐️ it and share it. Want a feature? Open an issue or PR!

## 📄 License

MIT

---

> Built to solve my own edge/serverless syntax highlighting problem. Hope it helps you too! 💡🚀