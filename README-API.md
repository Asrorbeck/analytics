# AI Assistant - Setup Guide

## 🚀 Qanday ishga tushirish

### 1. Dependencies o'rnatish

```bash
npm install
```

### 2. Environment Variable sozlash

`.env` fayl yaratib, OpenAI API key ni qo'shing:

```bash
# .env fayl
VITE_OPENAI_API_KEY=sk-proj-your-api-key-here
```

### 3. Frontend ni ishga tushirish

```bash
npm run dev
```

## 📝 API

- **OpenAI API**: To'g'ridan-to'g'ri frontend dan chaqiriladi
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Modellar**: GPT-4o-mini, GPT-4o, GPT-3.5-turbo (avtomatik fallback)

## 🔑 API Key

OpenAI API key environment variable orqali olinadi:

```bash
# .env fayl
VITE_OPENAI_API_KEY=sk-proj-...
```

⚠️ **Xavfsizlik**: 
- API key ni hech qachon commit qilmang
- `.env` fayl `.gitignore` da bo'lishi kerak
- GitHub Pages uchun: Settings > Secrets > Actions > `VITE_OPENAI_API_KEY`

## 🎯 Qanday ishlaydi

1. Frontend (`ai-assistant.tsx`) foydalanuvchi savolini oladi
2. Ma'lumotlar konteksti (agar mavjud bo'lsa) tayyorlanadi
3. Frontend to'g'ridan-to'g'ri OpenAI API ga so'rov yuboradi
4. OpenAI javob qaytaradi (GPT-4o-mini, GPT-4o, yoki GPT-3.5-turbo)
5. Javob chatda ko'rsatiladi

## 📦 Backend

**Eslatma**: Hozircha backend ishlatilmaydi. Frontend to'g'ridan-to'g'ri OpenAI API ga so'rov yuboradi.

Agar keyinchalik backend kerak bo'lsa, `server.js` fayli mavjud va ishlatilishi mumkin.

## 🌍 Environment Variables

`.env` fayl yaratib, quyidagilarni qo'shing:

```env
VITE_OPENAI_API_KEY=sk-proj-your-api-key-here
```

**GitHub Pages uchun**: `README-ENV.md` faylini ko'ring.

## 🐛 Troubleshooting

### API key topilmayapti

- `.env` fayl mavjudligini tekshiring
- `VITE_OPENAI_API_KEY` nomi to'g'ri ekanligini tekshiring
- Browser console da: `console.log(import.meta.env.VITE_OPENAI_API_KEY)`

### API javob bermayapti

- OpenAI API key to'g'ri ekanligini tekshiring
- Internet aloqasini tekshiring
- Browser console da xatolarni ko'ring
- OpenAI dashboard da quota holatini tekshiring: https://platform.openai.com/usage
- CORS xatosi bo'lsa, bu normal (browser to'g'ridan-to'g'ri API ga so'rov yuboradi)

### Rate limit xatosi

- Bir necha daqiqa kutib, qayta urinib ko'ring
- OpenAI dashboard da quota holatini tekshiring: https://platform.openai.com/usage
