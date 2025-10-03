# 🔧 Netlify Deployment Fix

## ❌ **Error yang Terjadi:**
```
sh: 1: vite: not found
Command failed with exit code 127: npm run build
```

## ✅ **Solusi yang Diterapkan:**

### 1. **Update netlify.toml**
```toml
[build]
  command = "npm ci && npm run build"
  functions = "netlify/functions"
  publish = "dist"

# Node.js version
[build.environment]
  NODE_VERSION = "18"
```

### 2. **Buat .nvmrc**
```
18
```

### 3. **Konfigurasi yang Sudah Diperbaiki:**
- ✅ Dependencies installation: `npm ci` sebelum build
- ✅ Node.js version: 18
- ✅ Build command yang benar
- ✅ Netlify Functions setup
- ✅ CORS configuration

## 🚀 **Cara Deploy Sekarang:**

### **Option 1: Via Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login ke Netlify
netlify login

# Deploy ke production
netlify deploy --prod
```

### **Option 2: Via Netlify Dashboard**
1. Push semua perubahan ke GitHub
2. Netlify akan otomatis rebuild dengan konfigurasi baru
3. Build akan berhasil dengan `npm ci && npm run build`

### **Option 3: Manual Deploy**
```bash
# Build lokal
npm run build

# Deploy folder dist ke Netlify
netlify deploy --dir=dist --prod
```

## 📋 **Checklist Sebelum Deploy:**

- ✅ `netlify.toml` sudah diperbaiki
- ✅ `.nvmrc` sudah dibuat
- ✅ `package.json` dependencies sudah lengkap
- ✅ Build lokal berhasil
- ✅ Netlify Functions sudah dikonfigurasi
- ✅ CORS Worker AI sudah diupdate

## 🎯 **Hasil Setelah Fix:**

- ✅ Build akan berhasil di Netlify
- ✅ Frontend akan accessible di `https://ayat-sains-insight.netlify.app`
- ✅ Backend API akan accessible di `/api/*`
- ✅ Chatbot akan berfungsi dengan sempurna

## 🔍 **Jika Masih Error:**

1. **Check Node.js Version:**
   ```bash
   node --version  # Should be 18.x.x
   ```

2. **Check Dependencies:**
   ```bash
   npm install
   npm run build
   ```

3. **Alternative Build Command:**
   ```toml
   [build]
   command = "npm install && npm run build"
   ```

## 📞 **Support:**
Jika masih ada masalah, check:
- Netlify build logs untuk error detail
- Package.json dependencies
- Node.js version compatibility
