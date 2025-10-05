# Chatbot Testing & Debugging Guide

## Current Status
- ✅ API routing: Fixed
- ✅ Fetch surah/tafsir: Working
- 🔧 Chatbot: Debugging in progress

## Latest Fixes Applied

### 1. Enhanced Error Handling
- Added detailed logging for all chatbot requests
- Separate error handling for JSON parsing
- Better response validation

### 2. Debugging Added
```javascript
// Logs will show:
- Request body received
- Parsed request body
- Worker-ai response status
- Worker-ai response headers  
- Worker-ai response text (before JSON parse)
- Any parsing errors
```

## How to Test Chatbot

### After Deployment (2-3 minutes):

#### Test 1: Basic Chatbot Message
1. Open https://neuroquran.daivanlabs.com
2. Scroll to "Asisten Al-Quran" chatbot
3. Type: "Assalamu'alaikum"
4. Press Enter
5. **Expected**: Bot responds with greeting

#### Test 2: Question About Quran
1. Ask: "Apa itu tafsir?"
2. **Expected**: Bot explains about tafsir

#### Test 3: Context-Aware (after analyzing a verse)
1. First, analyze an ayat (e.g., Al-Baqarah:22)
2. Then ask chatbot: "Jelaskan lebih detail tentang ayat ini"
3. **Expected**: Bot uses context from analyzed verse

## Checking Logs

### Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Try sending a chatbot message
4. **Look for**:
   ```
   POST https://neuroquran.daivanlabs.com/api/ai/chatbot
   Status: should be 200 (not 500)
   ```

### Network Tab
1. Open DevTools → Network tab
2. Send chatbot message
3. Click on "chatbot" request
4. Check:
   - **Request Payload**: Should have {message: "..."}
   - **Response**: Should be valid JSON with {reply: "..."}

### Netlify Function Logs
1. Go to: https://app.netlify.com
2. Functions → api
3. **Look for these debug messages**:
   ```
   Chatbot request
   Request body: {"message":"test"}
   Parsed request body: [Object object]
   Calling worker-ai chatbot endpoint...
   Worker-ai response status: 200
   Worker-ai response text: {"code":200,"reply":"..."}
   ```

## Common Issues & Solutions

### Issue 1: "Unexpected token N in JSON"
**Cause**: Response is not valid JSON (might be "Not Found" or "Null")

**Debug**:
- Check worker-ai logs
- Verify worker-ai is deployed and running
- Check worker-ai endpoint URL

**Solution**: Already added detailed error logging

### Issue 2: 500 Internal Server Error
**Causes**:
1. Worker-ai endpoint down
2. OPENROUTER_API_KEY missing or invalid
3. Request format incorrect

**Debug**: Check Netlify logs for error details

### Issue 3: CORS Error
**Cause**: Same-origin already fixed, but worker-ai might have CORS issues

**Solution**: Worker-ai already has CORS headers configured

## Testing Worker-AI Directly

You can test worker-ai endpoint directly:

```bash
curl -X POST https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/chatbot \
  -H "Content-Type: application/json" \
  -d '{"message":"Assalamualaikum"}'
```

**Expected Response**:
```json
{
  "code": 200,
  "reply": "Wa'alaikumussalam warahmatullahi wabarakatuh..."
}
```

## Request Format

Chatbot expects:
```json
{
  "message": "User message here",
  "context": null,  // or verse context if analyzing
  "conversationHistory": []  // optional
}
```

## Response Format

Chatbot should return:
```json
{
  "code": 200,
  "reply": "AI response here"
}
```

## Next Steps

1. **Wait 2-3 minutes** for deployment
2. **Hard refresh** browser
3. **Test chatbot** with simple message
4. **Check console** for errors
5. **Check Network tab** for response details
6. **If still error**:
   - Check Netlify Function logs
   - Test worker-ai directly (curl command above)
   - Check worker-ai deployment status
   - Verify OPENROUTER_API_KEY is set

## Expected Behavior After Fix

✅ Detailed error logging
✅ Better error messages
✅ JSON parse validation
✅ Response status checking
✅ Clear debugging information

The enhanced logging will tell us exactly where the issue is if it persists.
