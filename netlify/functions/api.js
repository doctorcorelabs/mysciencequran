import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from '../../backend/db.js'; // Import the database connection
import fetch from 'node-fetch'; // Import node-fetch

const app = express();

// CORS configuration for Netlify
app.use(cors({
  origin: [
    'https://mysciencequran.daivanlabs.com',
    'https://neuroquran.daivanlabs.com',
    'https://ayat-sains-insight.netlify.app',
    'http://localhost:8080',
    'http://127.0.0.1:8080'
  ],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Neuro-Quran Insight Backend API', status: 'running' });
});

// Proxy endpoint for equran.id API - Get Surah details and verses
app.get('/api/quran/surah/:nomor', async (req, res) => {
  const { nomor } = req.params;
  try {
    const response = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching surah from equran.id:', error);
    res.status(500).json({ error: 'Failed to fetch surah data' });
  }
});

// Proxy endpoint for equran.id API - Get Tafsir details
app.get('/api/quran/tafsir/:nomor', async (req, res) => {
  const { nomor } = req.params;
  try {
    const response = await fetch(`https://equran.id/api/v2/tafsir/${nomor}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching tafsir from equran.id:', error);
    res.status(500).json({ error: 'Failed to fetch tafsir data' });
  }
});

// API route to get all verses (for testing database connection)
app.get('/api/verses', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM verses LIMIT 10'); // Limit for initial testing
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Proxy endpoint for AI analysis
app.post('/api/ai/analyze', async (req, res) => {
  try {
    const aiInput = req.body; // The body should contain verse and tafsir data
    
    // Explicitly force Indonesian language in multiple ways to ensure API understands
    const aiResponse = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': 'id-ID', // Request Indonesian language
        'X-Preferred-Language': 'id-ID', // Custom header for language preference
      },
      body: JSON.stringify({
        ...aiInput,
        preferredLanguage: 'id', // Explicitly tell the worker we want Indonesian
        useIndonesian: true, // Additional flag to force Indonesian
        languageRequirement: 'strict-indonesian', // More explicit language requirement
      }),
    });
    const aiResult = await aiResponse.json();
    res.json(aiResult);
  } catch (error) {
    console.error('Error during AI analysis proxy:', error);
    res.status(500).json({ error: 'Failed to perform AI analysis' });
  }
});

// Proxy for generating a question
app.post('/api/ai/generate-question', async (req, res) => {
  try {
    const response = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying generate-question to worker-ai:', error);
    res.status(500).json({ error: 'Failed to proxy question generation request' });
  }
});

// Proxy for evaluating an answer
app.post('/api/ai/evaluate-answer', async (req, res) => {
  try {
    const response = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/evaluate-answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying evaluate-answer to worker-ai:', error);
    res.status(500).json({ error: 'Failed to proxy answer evaluation request' });
  }
});

// Proxy endpoint for chatbot
app.post('/api/ai/chatbot', async (req, res) => {
  try {
    const response = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/chatbot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error proxying chatbot to worker-ai:', error);
    res.status(500).json({ error: 'Failed to proxy chatbot request' });
  }
});

// Netlify Functions handler
export const handler = async (event, context) => {
  // Get the origin from the request headers
  const requestOrigin = event.headers.origin || event.headers.Origin || '';
  
  // List of allowed origins
  const allowedOrigins = [
    'https://mysciencequran.daivanlabs.com',
    'https://neuroquran.daivanlabs.com',
    'https://ayat-sains-insight.netlify.app',
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ];

  // Determine the origin to allow
  const allowOrigin = allowedOrigins.includes(requestOrigin) ? requestOrigin : '*';

  // CORS headers
  const corsHeaders = { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language, X-Preferred-Language',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Vary': 'Origin'
  };

  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  // Parse body safely
  let requestBody = null;
  try {
    requestBody = event.body ? JSON.parse(event.body) : null;
  } catch (e) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Invalid JSON in request body' })
    };
  }

  // Extract the actual API path from the request
  // Priority: rawUrl > path > default
  let actualPath = '/';
  
  console.log('DEBUG - event.path:', event.path);
  console.log('DEBUG - event.rawUrl:', event.rawUrl);
  console.log('DEBUG - event.headers:', JSON.stringify(event.headers));
  
  // Try to get path from rawUrl first (most reliable)
  if (event.rawUrl) {
    try {
      const urlObj = new URL(event.rawUrl);
      actualPath = urlObj.pathname;
      console.log('DEBUG - Path from rawUrl:', actualPath);
    } catch (e) {
      console.error('DEBUG - Error parsing rawUrl:', e);
    }
  }
  
  // Fallback: use event.path
  if (actualPath === '/' && event.path) {
    actualPath = event.path;
    // Remove /.netlify/functions/api prefix if present
    if (actualPath.includes('/.netlify/functions/api')) {
      actualPath = actualPath.replace('/.netlify/functions/api', '');
      if (!actualPath) actualPath = '/';
    }
    console.log('DEBUG - Path from event.path:', actualPath);
  }
  
  // Ensure path starts with /api for consistent matching (if not root)
  if (actualPath !== '/' && !actualPath.startsWith('/api')) {
    actualPath = '/api' + actualPath;
  }
  
  console.log('DEBUG - Final actualPath for routing:', actualPath);

  // Convert Netlify event to Express-like request
  const request = {
    method: event.httpMethod,
    url: actualPath,
    headers: event.headers,
    body: requestBody,
    params: event.pathParameters || {},
    query: event.queryStringParameters || {}
  };

  // Mock response object with CORS headers
  let responseBody = '';
  let statusCode = 200;
  let headers = { ...corsHeaders };

  const response = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseBody = JSON.stringify(data);
        }
      };
    },
    json: (data) => {
      responseBody = JSON.stringify(data);
    },
    set: (key, value) => {
      headers[key] = value;
    }
  };

  try {
    // Log for debugging (will appear in Netlify logs)
    console.log('Request method:', request.method);
    console.log('Request URL:', request.url);
    console.log('Request path:', event.path);
    
    // Normalize the path - remove leading slash if exists for consistent matching
    const normalizedPath = request.url.startsWith('/') ? request.url : '/' + request.url;
    
    // Route the request based on method and path
    if (request.method === 'GET' && normalizedPath === '/') {
      response.json({ message: 'Neuro-Quran Insight Backend API', status: 'running' });
    } else if (request.method === 'GET' && (normalizedPath.includes('/quran/surah/') || normalizedPath.startsWith('/api/quran/surah/'))) {
      const nomor = normalizedPath.split('/').pop();
      const fetchResponse = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
      const data = await fetchResponse.json();
      response.json(data);
    } else if (request.method === 'GET' && (normalizedPath.includes('/quran/tafsir/') || normalizedPath.startsWith('/api/quran/tafsir/'))) {
      const nomor = normalizedPath.split('/').pop();
      const fetchResponse = await fetch(`https://equran.id/api/v2/tafsir/${nomor}`);
      const data = await fetchResponse.json();
      response.json(data);
    } else if (request.method === 'POST' && (normalizedPath.includes('/ai/analyze') || normalizedPath === '/api/ai/analyze')) {
      const aiResponse = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'id-ID',
          'X-Preferred-Language': 'id-ID',
        },
        body: JSON.stringify({
          ...request.body,
          preferredLanguage: 'id',
          useIndonesian: true,
          languageRequirement: 'strict-indonesian',
        }),
      });
      const aiResult = await aiResponse.json();
      response.json(aiResult);
    } else if (request.method === 'POST' && (normalizedPath.includes('/ai/generate-question') || normalizedPath === '/api/ai/generate-question')) {
      const fetchResponse = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      });
      const data = await fetchResponse.json();
      response.status(fetchResponse.status).json(data);
    } else if (request.method === 'POST' && (normalizedPath.includes('/ai/evaluate-answer') || normalizedPath === '/api/ai/evaluate-answer')) {
      const fetchResponse = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      });
      const data = await fetchResponse.json();
      response.status(fetchResponse.status).json(data);
    } else if (request.method === 'POST' && (normalizedPath.includes('/ai/chatbot') || normalizedPath === '/api/ai/chatbot')) {
      console.log('Chatbot endpoint hit, forwarding to worker-ai...');
      const fetchResponse = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      });
      const data = await fetchResponse.json();
      console.log('Chatbot response received from worker-ai');
      response.status(fetchResponse.status).json(data);
    } else {
      console.log('No route matched. Available info:', { method: request.method, url: normalizedPath });
      response.status(404).json({ error: 'Endpoint not found', path: normalizedPath, method: request.method });
    }
  } catch (error) {
    console.error('Error in Netlify function:', error);
    console.error('Error stack:', error.stack);
    response.status(500).json({ error: 'Internal server error', message: error.message });
  }

  // Ensure CORS headers are always present in response
  return {
    statusCode,
    headers: {
      ...headers,
      ...corsHeaders // Ensure CORS headers are always included
    },
    body: responseBody
  };
};
