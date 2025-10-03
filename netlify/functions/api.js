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
  // Convert Netlify event to Express-like request
  const request = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    body: event.body ? JSON.parse(event.body) : null,
    params: event.pathParameters || {},
    query: event.queryStringParameters || {}
  };

  // Mock response object
  let responseBody = '';
  let statusCode = 200;
  let headers = { 'Content-Type': 'application/json' };

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
    // Route the request based on method and path
    if (request.method === 'GET' && request.url === '/') {
      response.json({ message: 'Neuro-Quran Insight Backend API', status: 'running' });
    } else if (request.method === 'GET' && request.url.startsWith('/api/quran/surah/')) {
      const nomor = request.url.split('/').pop();
      const fetchResponse = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
      const data = await fetchResponse.json();
      response.json(data);
    } else if (request.method === 'GET' && request.url.startsWith('/api/quran/tafsir/')) {
      const nomor = request.url.split('/').pop();
      const fetchResponse = await fetch(`https://equran.id/api/v2/tafsir/${nomor}`);
      const data = await fetchResponse.json();
      response.json(data);
    } else if (request.method === 'POST' && request.url === '/api/ai/analyze') {
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
    } else if (request.method === 'POST' && request.url === '/api/ai/generate-question') {
      const fetchResponse = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      });
      const data = await fetchResponse.json();
      response.status(fetchResponse.status).json(data);
    } else if (request.method === 'POST' && request.url === '/api/ai/evaluate-answer') {
      const fetchResponse = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      });
      const data = await fetchResponse.json();
      response.status(fetchResponse.status).json(data);
    } else if (request.method === 'POST' && request.url === '/api/ai/chatbot') {
      const fetchResponse = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request.body),
      });
      const data = await fetchResponse.json();
      response.status(fetchResponse.status).json(data);
    } else {
      response.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Error in Netlify function:', error);
    response.status(500).json({ error: 'Internal server error' });
  }

  return {
    statusCode,
    headers,
    body: responseBody
  };
};
