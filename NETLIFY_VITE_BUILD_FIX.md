# Netlify Vite Build Fix

## Problem
Error yang terjadi: `bash: line 1: ./node_modules/.bin/vite: No such file or directory`

## Root Cause
Vite berada di `devDependencies` tapi Netlify menggunakan `npm ci` yang hanya install production dependencies.

## Solutions Applied

### 1. Move Vite to Dependencies (Primary Fix)
- Memindahkan `vite` dari `devDependencies` ke `dependencies` di `package.json`
- Ini memastikan Vite ter-install saat deploy

### 2. Update Build Command
- Mengubah build command dari `./node_modules/.bin/vite build` ke `npx vite build`
- `npx` lebih reliable untuk menemukan executable

### 3. Environment Variables
- Set `NODE_ENV = "development"` di build environment
- Ini memastikan devDependencies ter-install jika diperlukan

## Files Modified
1. `package.json` - Moved vite to dependencies
2. `netlify.toml` - Updated build command and environment

## Alternative Solutions
Jika masih ada masalah, coba gunakan `netlify-simple-fix.toml`:
```bash
# Rename file
mv netlify.toml netlify-backup.toml
mv netlify-simple-fix.toml netlify.toml
```

## Testing
Test locally before deploy:
```bash
npm ci
npx vite build
```

## Common Issues
1. **Cache Issues**: Clear Netlify build cache
2. **Node Version**: Ensure Node 18 is used
3. **Dependencies**: Run `npm audit fix` for security issues

## Deployment Steps
1. Commit changes
2. Push to repository
3. Netlify will auto-deploy
4. Check build logs for success