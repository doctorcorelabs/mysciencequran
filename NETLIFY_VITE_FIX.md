# 🔧 Netlify Vite Build Fix

## ❌ **Error yang Terjadi:**
```
sh: 1: vite: not found
Command failed with exit code 127: npm run build
```

## 🔍 **Root Cause:**
- Netlify tidak dapat menemukan `vite` command di `node_modules/.bin`
- Meskipun `vite` ada di `devDependencies`, path tidak ter-resolve dengan benar

## ✅ **Solusi yang Diterapkan:**

### 1. **Update Build Command di netlify.toml**
```toml
[build]
  command = "npm install && npx vite build"
  functions = "netlify/functions"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

### 2. **Perubahan Key:**
- ✅ **Dari**: `npm ci && npm run build`
- ✅ **Ke**: `npm install && npx vite build`
- ✅ **Alasan**: `npx` akan mencari `vite` di `node_modules/.bin`

### 3. **Konfigurasi Final:**
```toml
[build]
  command = "npm install && npx vite build"
  functions = "netlify/functions"
  publish = "dist"

# Redirect all API calls to Netlify Functions
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200

# Redirect all other routes to index.html for SPA
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Node.js version
[build.environment]
  NODE_VERSION = "18"

# Environment variables for production
[context.production.environment]
  NODE_ENV = "production"
  VITE_API_BASE_URL = "https://ayat-sains-insight.netlify.app"
```

## 🧪 **Testing:**

### **Lokal Test (Berhasil ✅):**
```bash
# Clean install
npm install

# Build dengan npx
npx vite build
# ✓ built in 14.74s
```

### **Dependencies Check:**
- ✅ `vite: ^5.4.1` di devDependencies
- ✅ `package-lock.json` ada
- ✅ `npx vite build` berfungsi lokal

## 🚀 **Deploy Instructions:**

### **Option 1: Netlify Dashboard**
1. Push semua perubahan ke GitHub
2. Netlify akan otomatis rebuild dengan command baru
3. Build akan berhasil dengan `npm install && npx vite build`

### **Option 2: Netlify CLI**
```bash
netlify deploy --prod
```

### **Option 3: Manual Build Test**
```bash
# Test build command yang akan digunakan Netlify
npm install && npx vite build
```

## 📋 **Alternative Configurations:**

### **Config 1: Standard (Current)**
```toml
[build]
  command = "npm install && npx vite build"
```

### **Config 2: With npm ci**
```toml
[build]
  command = "npm ci && npx vite build"
```

### **Config 3: Full path**
```toml
[build]
  command = "npm install && ./node_modules/.bin/vite build"
```

## 🎯 **Expected Result:**
- ✅ Build berhasil di Netlify
- ✅ Frontend accessible di `https://ayat-sains-insight.netlify.app`
- ✅ Chatbot berfungsi dengan 2 mode
- ✅ Backend API accessible di `/api/*`

## 🔍 **If Still Failing:**

1. **Check Node.js Version:**
   ```bash
   node --version  # Should be 18.x.x
   ```

2. **Verify Dependencies:**
   ```bash
   npm list vite
   ```

3. **Alternative Build Command:**
   ```toml
   [build]
   command = "npm install && ./node_modules/.bin/vite build"
   ```

## 📞 **Debug Steps:**
1. Check Netlify build logs untuk error detail
2. Verify `package.json` dependencies
3. Test build command lokal
4. Check Node.js version compatibility

**Ready to deploy!** 🚀
