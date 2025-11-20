# Environment Variables - Setup Guide

## 🔑 OpenAI API Key sozlash

### Local Development uchun

1. `.env` fayl yaratish (loyiha root papkasida):
   ```bash
   # .env fayl
   VITE_OPENAI_API_KEY=sk-proj-your-api-key-here
   ```

2. `.env` faylni `.gitignore` ga qo'shish (agar yo'q bo'lsa):
   ```
   .env
   .env.local
   ```

### GitHub Pages uchun

GitHub Pages da environment variable qo'shish:

1. **GitHub repository ga o'ting**
2. **Settings** > **Secrets and variables** > **Actions**
3. **New repository secret** ni bosing
4. **Name**: `VITE_OPENAI_API_KEY`
5. **Secret**: OpenAI API key ni kiriting
6. **Add secret** ni bosing

### GitHub Actions workflow sozlash

`.github/workflows/deploy.yml` fayl yaratish (agar yo'q bo'lsa):

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        env:
          VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Vite Build uchun

Vite build qilganda environment variable avtomatik olinadi:

```bash
# Local
npm run build

# GitHub Actions
# Environment variable avtomatik olinadi
```

### ⚠️ Xavfsizlik

- **API key ni hech qachon commit qilmang**
- `.env` faylni `.gitignore` ga qo'shing
- GitHub Pages da faqat `VITE_` bilan boshlanadigan variable lar build vaqtida olinadi
- Production uchun backend server ishlatish tavsiya etiladi

### 🔍 Tekshirish

API key to'g'ri sozlanganini tekshirish:

1. Browser console da: `console.log(import.meta.env.VITE_OPENAI_API_KEY)`
2. Agar `undefined` bo'lsa, environment variable to'g'ri sozlanmagan

