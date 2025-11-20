# GitHub Pages Deploy Guide

## ⚠️ Muhim: API Key Xavfsizligi

GitHub Pages ga deploy qilishdan oldin, API key ni kodga kiritmaslik kerak!

## 🚀 Deploy qilish

### 1. Environment Variable ni o'chirish

Deploy qilishdan oldin `.env` faylni o'chiring yoki environment variable ni o'chiring:

```bash
# .env faylni o'chirish
rm .env

# Yoki environment variable ni o'chirish
unset VITE_OPENAI_API_KEY
```

### 2. Build qilish

```bash
npm run build
```

### 3. Deploy qilish

```bash
npm run deploy
```

## 📝 Qanday ishlaydi

1. **Build vaqtida**: Agar `VITE_OPENAI_API_KEY` bo'lmasa, u bundle ga kiritilmaydi
2. **Runtime da**: Foydalanuvchi API key ni brauzerda kiritadi va localStorage ga saqlanadi
3. **Xavfsizlik**: API key faqat foydalanuvchining brauzerida saqlanadi, GitHub ga yuborilmaydi

## 🔑 API Key kiritish

1. Saytni oching
2. AI Assistant sahifasiga o'ting
3. API key input ko'rsatiladi
4. API key ni kiriting va "Saqlash" ni bosing
5. API key localStorage ga saqlanadi

## ⚠️ Eslatma

- API key localStorage ga saqlanadi (faqat sizning brauzeringizda)
- Har bir foydalanuvchi o'z API key ni kiritishi kerak
- API key hech qachon GitHub ga yuborilmaydi
