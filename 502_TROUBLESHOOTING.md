# 502 Error Troubleshooting Guide

## Current Status
- ✅ CORS: FIXED (using same-origin)
- ❌ 502 Bad Gateway: Function execution error

## Most Recent Fix
Removed `node-fetch` import - using native fetch in Node 18+

## How to Check Netlify Function Logs

### Option 1: Netlify Dashboard
1. Go to: https://app.netlify.com
2. Login with your account
3. Select your site (ayat-sains-insight or similar)
4. Click "Functions" in the left sidebar
5. Click on "api" function
6. View the logs at the bottom
7. **Look for these DEBUG messages:**
   ```
   === Netlify Function Called ===
   Method: GET
   Path: ...
   RawUrl: ...
   ```

### Option 2: Netlify CLI (if installed)
```bash
netlify functions:log api
```

## What to Look For in Logs

### If you see import errors:
```
Error: Cannot find module 'node-fetch'
```
**Solution**: Already fixed - using native fetch

### If you see "handler is not a function":
```
handler is not a function
```
**Solution**: Check export format

### If you see timeout:
```
Task timed out after 10.00 seconds
```
**Solution**: External API might be slow

## Alternative: Test Function Directly

You can test the function endpoint directly:

```bash
# Test with curl
curl -v https://neuroquran.daivanlabs.com/.netlify/functions/api

# Or visit in browser:
https://neuroquran.daivanlabs.com/.netlify/functions/api
```

**Expected Response**:
```json
{
  "message": "Neuro-Quran Insight API",
  "status": "running",
  "path": "..."
}
```

## Common 502 Causes

1. **Import/Module Errors** ✅ Fixed
   - Removed node-fetch import
   - Using native fetch

2. **Syntax Errors**
   - Check for typos in code
   - Verify all brackets/parentheses match

3. **Async/Await Issues**
   - Make sure all async functions are awaited
   - Proper error handling

4. **Memory/Timeout**
   - Function might be taking too long
   - External API might be down

5. **Configuration Issues**
   - Node version mismatch
   - Missing dependencies

## Next Steps After Latest Push

1. **Wait 2-3 minutes** for deployment
2. **Hard refresh** browser (Ctrl+Shift+R)
3. **Test the API**:
   - Try fetching a surah
   - Check browser console
   - Check Network tab

4. **If still 502**:
   - Check Netlify logs (see above)
   - Look for specific error messages
   - Share the error message for further debugging

## Manual Test Commands

### Test Surah Endpoint
```bash
curl https://neuroquran.daivanlabs.com/api/quran/surah/1
```

### Test Tafsir Endpoint
```bash
curl https://neuroquran.daivanlabs.com/api/quran/tafsir/1
```

### Test Direct Function
```bash
curl https://neuroquran.daivanlabs.com/.netlify/functions/api
```

## If All Else Fails

### Option A: Check Netlify Build Logs
1. Go to: https://app.netlify.com
2. Click "Deploys"
3. Click latest deploy
4. Check build log for errors

### Option B: Local Testing
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Test locally
netlify dev
```

### Option C: Simplify Further
If still having issues, we can:
1. Create separate functions for each endpoint
2. Use Netlify Edge Functions instead
3. Switch to a different deployment strategy

## Expected Behavior After Fix

✅ No import errors
✅ Function loads correctly
✅ Responds to requests
✅ Proxies to equran.id successfully
✅ Returns data with CORS headers
