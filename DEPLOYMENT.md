# 🚀 Deployment Guide - Neuro-Quran Insight

## 📋 **Status Deployment:**

### ✅ **Sudah Deploy:**
1. **Cloudflare Worker AI**: `https://worker-ai.daivanfebrijuansetiya.workers.dev`
2. **CORS**: Sudah dikonfigurasi untuk domain Netlify

### 🔄 **Siap Deploy:**
1. **Frontend + Backend**: Siap di-deploy ke Netlify
2. **Netlify Functions**: Backend API sudah dikonfigurasi
3. **Environment**: Production config sudah disetup

## 🛠️ **Cara Deploy:**

### **Option 1: Deploy via Netlify CLI**
```bash
# Install Netlify CLI (jika belum)
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Deploy ke production
netlify deploy --prod
```

### **Option 2: Deploy via Netlify Dashboard**
1. Push code ke GitHub repository
2. Connect repository ke Netlify
3. Netlify akan otomatis build dan deploy

### **Option 3: Deploy Worker AI (jika ada perubahan)**
```bash
cd worker-ai
npm run deploy
```

## 📁 **Struktur Deployment:**

```
├── dist/                          # Frontend build output
├── netlify/
│   └── functions/
│       └── api.js                 # Backend API as Netlify Function
├── netlify.toml                   # Netlify configuration
└── worker-ai/                     # Cloudflare Worker (sudah deployed)
```

## 🔗 **URLs Setelah Deploy:**

- **Frontend**: `https://ayat-sains-insight.netlify.app`
- **Backend API**: `https://ayat-sains-insight.netlify.app/api/*`
- **Worker AI**: `https://worker-ai.daivanfebrijuansetiya.workers.dev`

## ⚙️ **Konfigurasi:**

### **Environment Variables:**
- Production API URL: `https://ayat-sains-insight.netlify.app`
- Development API URL: `http://localhost:8787`

### **CORS Configuration:**
Worker AI sudah dikonfigurasi untuk menerima request dari:
- `https://ayat-sains-insight.netlify.app`
- `https://ayat-sains-insight--main.netlify.app` (branch preview)
- `https://mysciencequran.daivanlabs.com`
- `https://neuroquran.daivanlabs.com`

## 🧪 **Testing Deployment:**

### **Test Frontend:**
```bash
npm run build
npm run preview
```

### **Test API Endpoints:**
```bash
# Test health check
curl https://ayat-sains-insight.netlify.app/api/

# Test chatbot
curl -X POST https://ayat-sains-insight.netlify.app/api/ai/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message": "Apa itu Al-Quran?"}'
```

## 🎯 **Features yang Sudah Siap:**

✅ **Chatbot Popup** dengan dua mode:
- Mode Universal (tanpa analisis ayat)
- Mode Kontekstual (dengan analisis ayat)

✅ **Backend API** dengan endpoints:
- `/api/ai/chatbot` - Chatbot AI
- `/api/ai/analyze` - Analisis ayat
- `/api/ai/generate-question` - Generate pertanyaan
- `/api/ai/evaluate-answer` - Evaluasi jawaban
- `/api/quran/surah/:id` - Data surah
- `/api/quran/tafsir/:id` - Data tafsir

✅ **Islamic Terminology** - Menggunakan istilah Islam yang tepat

## 🚀 **Ready to Deploy!**

Semua konfigurasi sudah selesai. Tinggal deploy ke Netlify dan aplikasi akan berfungsi dengan chatbot yang telah dibuat!
