// Simple Netlify Function without Express
// Handles API proxying with proper CORS
// Uses native fetch (Node 18+)
// Updated: Added chatbot endpoint support - 2025-01-03

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language, X-Preferred-Language',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Content-Type': 'application/json'
};

export const handler = async (event, context) => {
  console.log('=== Netlify Function Called ===');
  console.log('Method:', event.httpMethod);
  console.log('Path:', event.path);
  console.log('RawUrl:', event.rawUrl);
  console.log('Headers Origin:', event.headers.origin);
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Extract the API path from rawUrl
    let apiPath = '/';
    if (event.rawUrl) {
      const url = new URL(event.rawUrl);
      apiPath = url.pathname;
      console.log('Extracted path from rawUrl:', apiPath);
    }
    
    console.log('Method:', event.httpMethod);
    console.log('Path for routing:', apiPath);
    console.log('Checking chatbot match:', apiPath.includes('/ai/chatbot'));

    // Route handling
    // GET /api/quran/surah/:nomor
    if (event.httpMethod === 'GET' && apiPath.match(/\/api\/quran\/surah\/(\d+)/)) {
      const match = apiPath.match(/\/api\/quran\/surah\/(\d+)/);
      const nomor = match[1];
      console.log('Fetching surah:', nomor);
      
      const response = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
      const data = await response.json();
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data)
      };
    }

    // GET /api/quran/tafsir/:nomor
    if (event.httpMethod === 'GET' && apiPath.match(/\/api\/quran\/tafsir\/(\d+)/)) {
      const match = apiPath.match(/\/api\/quran\/tafsir\/(\d+)/);
      const nomor = match[1];
      console.log('Fetching tafsir:', nomor);
      
      const response = await fetch(`https://equran.id/api/v2/tafsir/${nomor}`);
      const data = await response.json();
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify(data)
      };
    }

    // POST /api/ai/analyze
    if (event.httpMethod === 'POST' && apiPath.includes('/ai/analyze')) {
      console.log('AI Analyze request');
      const requestBody = JSON.parse(event.body || '{}');
      
      const response = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'id-ID',
          'X-Preferred-Language': 'id-ID',
        },
        body: JSON.stringify({
          ...requestBody,
          preferredLanguage: 'id',
          useIndonesian: true,
          languageRequirement: 'strict-indonesian',
        }),
      });
      
      const data = await response.json();
      
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify(data)
      };
    }

    // POST /api/ai/chatbot
    if (event.httpMethod === 'POST' && apiPath.includes('/ai/chatbot')) {
      console.log('Chatbot request');
      console.log('Request body:', event.body);
      
      try {
        const requestBody = JSON.parse(event.body || '{}');
        console.log('Parsed request body:', requestBody);
        
        console.log('Calling worker-ai chatbot endpoint...');
        const response = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/chatbot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        
        console.log('Worker-ai response status:', response.status);
        console.log('Worker-ai response headers:', response.headers);
        
        // Check if response is OK
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Worker-ai error response:', errorText);
          return {
            statusCode: response.status,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: 'Worker AI error', 
              status: response.status,
              message: errorText
            })
          };
        }
        
        // Try to parse JSON
        const responseText = await response.text();
        console.log('Worker-ai response text:', responseText);
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ 
              error: 'Invalid JSON from Worker AI',
              rawResponse: responseText.substring(0, 200)
            })
          };
        }
        
        return {
          statusCode: 200,
          headers: corsHeaders,
          body: JSON.stringify(data)
        };
      } catch (error) {
        console.error('Chatbot endpoint error:', error);
        return {
          statusCode: 500,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: 'Chatbot request failed',
            message: error.message
          })
        };
      }
    }

    // POST /api/ai/generate-question
    if (event.httpMethod === 'POST' && apiPath.includes('/ai/generate-question')) {
      console.log('Generate question request');
      const requestBody = JSON.parse(event.body || '{}');
      
      const response = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify(data)
      };
    }

    // POST /api/ai/evaluate-answer
    if (event.httpMethod === 'POST' && apiPath.includes('/ai/evaluate-answer')) {
      console.log('Evaluate answer request');
      const requestBody = JSON.parse(event.body || '{}');
      
      const response = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      return {
        statusCode: response.status,
        headers: corsHeaders,
        body: JSON.stringify(data)
      };
    }

    // Health check
    if (apiPath === '/' || apiPath === '/api' || apiPath.includes('/.netlify/functions/api')) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          message: 'Neuro-Quran Insight API', 
          status: 'running',
          path: apiPath
        })
      };
    }

    // No route matched
    console.log('No route matched for:', apiPath);
    return {
      statusCode: 404,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Endpoint not found',
        path: apiPath,
        method: event.httpMethod
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};
