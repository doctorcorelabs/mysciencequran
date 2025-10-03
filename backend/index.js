import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import db from './db.js'; // Import the database connection
import fetch from 'node-fetch'; // Import node-fetch

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('MyScienceQuran Backend API');
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
    const aiResponse = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/analyze', { // Corrected path
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

// --- NEW PROXY ENDPOINTS FOR INTERACTIVE AI FEATURES ---

// Proxy for generating a question
app.post('/api/ai/generate-question', async (req, res) => {
  try {
    const response = await fetch('https://worker-ai.daivanfebrijuansetiya.workers.dev/api/ai/generate-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any other necessary headers, e.g., for auth if your worker requires it
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
        // Add any other necessary headers
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
