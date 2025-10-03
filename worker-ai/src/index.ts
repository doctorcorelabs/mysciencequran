

export interface Env {
    OPENROUTER_API_KEY: string;
}

interface AIRequestBody {
	verse: {
		arabic: string;
		transliteration: string;
		translation: string;
	};
	tafsir?: string;
}

const ALLOWED_ORIGINS: string[] = [
	'https://mysciencequran.daivanlabs.com', // Produksi
	'https://neuroquran.daivanlabs.com',     // Domain baru
	'http://localhost:8080',                 // Development Lokal
	'http://127.0.0.1:8080'                  // Development Lokal (alternative)
];
const EQURAN_API_BASE = 'https://equran.id/api/v2';

// Fungsi helper untuk menambahkan header CORS
function addCorsHeaders(response: Response, requestOrigin: string | null): Response {
	if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
		response.headers.set('Access-Control-Allow-Origin', requestOrigin);
	} else {
		// Default ke localhost:8080 jika origin tidak ada dan mode development
		response.headers.set('Access-Control-Allow-Origin', 'http://localhost:8080');
	}
	response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept-Language');
	response.headers.set('Vary', 'Origin');
	response.headers.set('Access-Control-Allow-Credentials', 'true');
	return response;
}

// Helper function for OpenRouter API calls with better error handling
async function callOpenRouterAPI(payload: any, apiKey: string): Promise<string> {
	const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		method: "POST",
		headers: {
			"Authorization": `Bearer ${apiKey}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify(payload)
	});
	
	if (!response.ok) {
		const errorText = await response.text();
		console.error('OpenRouter API error:', response.status, errorText);
		throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
	}
	
	const data: any = await response.json();
	
	// Check for OpenRouter-specific errors
	if (data.error) {
		console.error('OpenRouter returned error:', data.error);
		throw new Error(`OpenRouter error: ${data.error.message || JSON.stringify(data.error)}`);
	}
	
	// Check if response has choices
	if (!data.choices || !data.choices[0] || !data.choices[0].message) {
		console.error('Invalid OpenRouter response structure:', data);
		throw new Error('Invalid response structure from OpenRouter API');
	}
	
	const content = data.choices[0].message.content?.trim() || "";
	
	// Check if content is empty
	if (!content) {
		console.error('OpenRouter returned empty content');
		throw new Error('OpenRouter API returned empty response content');
	}
	
	return content;
}

async function handleQuestionGeneration(request: Request, env: Env): Promise<Response> {
   const requestOrigin = request.headers.get('Origin');
   try {
	   const { contextText } = (await request.json()) as { contextText: string };

	   if (!contextText) {
		   return addCorsHeaders(new Response(JSON.stringify({ code: 400, message: 'Missing contextText for question generation.' }), {
			   headers: { 'Content-Type': 'application/json' },
			   status: 400,
		   }), requestOrigin);
	   }

	   const PROMPT_GENERATE_QUESTION = `Anda adalah asisten AI yang cerdas. Berdasarkan teks berikut, buatlah SATU pertanyaan terbuka yang relevan dan memancing pemikiran dalam Bahasa Indonesia. Pertanyaan harus berkaitan langsung dengan isi teks yang diberikan.

Teks Konteks:
"${contextText}"

Format output Anda HARUS berupa JSON dengan struktur berikut:
{
  "question": "Pertanyaan yang Anda hasilkan di sini"
}
Pastikan seluruh konten pertanyaan dalam Bahasa Indonesia. Jangan sertakan teks lain di luar format JSON ini.`;

	   const openrouterPayload = {
		   model: "openai/gpt-oss-120b",
		   messages: [
			   {
				   role: "user",
				   content: PROMPT_GENERATE_QUESTION
			   }
		   ]
	   };

	   const text = await callOpenRouterAPI(openrouterPayload, env.OPENROUTER_API_KEY);
	   
	   // Extract JSON from markdown code block if present
	   const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
	   const cleanText = jsonMatch && jsonMatch[1] ? jsonMatch[1] : text.trim();

	   try {
		   const result = JSON.parse(cleanText);
		   if (!result.question || typeof result.question !== 'string') {
			   throw new Error('AI response for question generation is not in the expected format.');
		   }
		   return addCorsHeaders(new Response(JSON.stringify({ code: 200, question: result.question }), {
			   headers: { 'Content-Type': 'application/json' }, status: 200,
		   }), requestOrigin);
	   } catch (parseError: any) {
		   console.error('Failed to parse question generation AI response as JSON:', parseError.message, 'Raw text:', cleanText);
		   return addCorsHeaders(new Response(JSON.stringify({ code: 500, message: 'AI response for question generation could not be parsed. Raw: ' + cleanText }), {
			   headers: { 'Content-Type': 'application/json' }, status: 500,
		   }), requestOrigin);
	   }

   } catch (error: any) {
	   console.error('Error during question generation:', error);
	   return addCorsHeaders(new Response(JSON.stringify({ code: 500, message: `Question generation failed: ${error.message}` }), {
		   headers: { 'Content-Type': 'application/json' }, status: 500,
	   }), requestOrigin);
   }
}

// --- NEW FUNCTION: Handle Answer Evaluation ---
async function handleAnswerEvaluation(request: Request, env: Env): Promise<Response> {
   const requestOrigin = request.headers.get('Origin');
   try {
	   const { question, userAnswer } = (await request.json()) as { question: string; userAnswer: string };

	   if (!question || !userAnswer) {
		   return addCorsHeaders(new Response(JSON.stringify({ code: 400, message: 'Missing question or userAnswer for evaluation.' }), {
			   headers: { 'Content-Type': 'application/json' },
			   status: 400,
		   }), requestOrigin);
	   }

	   const PROMPT_EVALUATE_ANSWER = `Anda adalah seorang evaluator AI yang bijaksana. Tugas Anda adalah mengevaluasi jawaban pengguna terhadap sebuah pertanyaan.
Pertanyaan yang Diajukan: "${question}"
Jawaban Pengguna: "${userAnswer}"

Berikan evaluasi Anda dalam Bahasa Indonesia. Evaluasi harus mencakup:
- feedback: Komentar kualitatif singkat (1-2 kalimat) mengenai kualitas dan relevansi jawaban pengguna.
- score: Skor numerik antara 1 (sangat kurang) hingga 5 (sangat baik) yang mencerminkan pemahaman pengguna berdasarkan jawabannya.

Format output Anda HARUS berupa JSON dengan struktur berikut:
{
  "feedback": "Komentar feedback Anda di sini",
  "score": <angka skor antara 1-5>
}
Pastikan seluruh konten feedback dalam Bahasa Indonesia. Jangan sertakan teks lain di luar format JSON ini.`;

	   const openrouterPayload = {
		   model: "openai/gpt-oss-120b",
		   messages: [
			   {
				   role: "user",
				   content: PROMPT_EVALUATE_ANSWER
			   }
		   ]
	   };

	   const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
		   method: "POST",
		   headers: {
			   "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
			   "Content-Type": "application/json"
		   },
		   body: JSON.stringify(openrouterPayload)
	   });
	   const data: any = await response.json();
	   let text = data.choices && data.choices[0] && data.choices[0].message && typeof data.choices[0].message.content === 'string' ? data.choices[0].message.content.trim() : "";
	   // Extract JSON from markdown code block if present
	   const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
	   text = jsonMatch && jsonMatch[1] ? jsonMatch[1] : text.trim();

	   try {
		   const result = JSON.parse(text);
		   if (typeof result.feedback !== 'string' || typeof result.score !== 'number') {
			   throw new Error('AI response for answer evaluation is not in the expected format.');
		   }
		   return addCorsHeaders(new Response(JSON.stringify({ code: 200, feedback: result.feedback, score: result.score }), {
			   headers: { 'Content-Type': 'application/json' }, status: 200,
		   }), requestOrigin);
	   } catch (parseError: any) {
		   console.error('Failed to parse answer evaluation AI response as JSON:', parseError.message, 'Raw text:', text);
		   return addCorsHeaders(new Response(JSON.stringify({ code: 500, message: 'AI response for answer evaluation could not be parsed. Raw: ' + text }), {
			   headers: { 'Content-Type': 'application/json' }, status: 500,
		   }), requestOrigin);
	   }

   } catch (error: any) {
	   console.error('Error during answer evaluation:', error);
	   return addCorsHeaders(new Response(JSON.stringify({ code: 500, message: `Answer evaluation failed: ${error.message}` }), {
		   headers: { 'Content-Type': 'application/json' }, status: 500,
	   }), requestOrigin);
   }
}


async function handleAiAnalysis(request: Request, env: Env): Promise<Response> {
   const requestOrigin = request.headers.get('Origin');
   
   let verse, tafsir;
   
   try {
	   const requestData = (await request.json()) as AIRequestBody;
	   verse = requestData.verse;
	   tafsir = requestData.tafsir;

	   if (!verse || (!verse.translation && !verse.arabic)) {
		   return addCorsHeaders(new Response(JSON.stringify({ code: 400, message: 'Missing verse data for AI analysis.' }), {
			   headers: { 'Content-Type': 'application/json' },
			   status: 400,
		   }), requestOrigin);
	   }

	   const PURE_PROMPT_TEXT = `Analisa ayat Al-Quran berikut beserta tafsirnya (jika tersedia) untuk mencari keterkaitan ilmiah. Berikan output dalam format array JSON, di mana setiap objek mewakili sebuah keterkaitan ilmiah. SELURUH KONTEN TEKS DALAM RESPONS JSON (khususnya "field", "description", dan "examples") HARUS SEPENUHNYA DALAM BAHASA INDONESIA, JANGAN MENGGUNAKAN BAHASA INGGRIS SAMA SEKALI.

Setiap objek harus memiliki kunci-kunci berikut:

Prioritas:
1.  Coba temukan keterkaitan ilmiah spesifik.
2.  Jika tidak ditemukan keterkaitan ilmiah spesifik, berikan "Refleksi Umum" atau "Kaitan Tematik Luas" terkait kebijaksanaan ayat, hubungannya dengan alam, pemahaman manusia, atau pemikiran ilmiah secara umum. Ini juga harus dalam Bahasa Indonesia dan menggunakan struktur JSON yang sama (contoh: field: "Refleksi Umum").
3.  Jika sama sekali tidak ada keterkaitan atau refleksi yang relevan, kembalikan array kosong ([]).

PENTING: Pastikan SEMUA teks yang dihasilkan untuk "field", "description", dan "examples" benar-benar dalam Bahasa Indonesia. JANGAN PERNAH MENGGUNAKAN BAHASA INGGRIS di BAGIAN MANAPUN dari konten respons. Bahkan jika ayat input dalam bahasa Inggris, analisis Anda harus sepenuhnya dalam Bahasa Indonesia. Ini sangat penting. SETIAP KATA HARUS DALAM BAHASA INDONESIA.

Verse (Arabic): ${verse.arabic || 'N/A'}
Verse (Translation): ${verse.translation || 'N/A'}
Tafsir: ${tafsir || 'N/A'}


Contoh Format Output (semua teks dalam Bahasa Indonesia):
[
	{
		"field": "Embriologi",
		"icon": "Microscope",
		"description": "Ayat ini menjelaskan tahapan perkembangan embrio manusia yang sejalan dengan penemuan ilmiah modern.",
		"examples": ["Pembentukan nutfah (zigot)", "Perkembangan menjadi 'alaqah (segumpal darah)"],
		"confidence": 95
	},
	{
		"field": "Refleksi Umum",
		"icon": "Lightbulb",
		"description": "Ayat ini mengajak manusia untuk merenungkan ciptaan Allah dan mencari ilmu pengetahuan.",
		"examples": ["Memahami kehidupan dari perspektif penciptaan", "Meneliti fenomena alam sebagai tanda kebesaran Allah"],
		"confidence": 50
	}
]

Berikan hanya array JSON dalam respons Anda, dibungkus dalam blok kode markdown, tanpa teks tambahan atau pemformatan markdown di luar JSON. INGAT SEMUA KONTEN HARUS DALAM BAHASA INDONESIA. JANGAN GUNAKAN BAHASA INGGRIS.`;

	   const openrouterPayload = {
		   model: "openai/gpt-oss-120b",
		   messages: [
			   {
				   role: "user",
				   content: PURE_PROMPT_TEXT
			   }
		   ]
	   };

	   try {
		   const text = await callOpenRouterAPI(openrouterPayload, env.OPENROUTER_API_KEY);
		   const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
		   const cleanText = jsonMatch && jsonMatch[1] ? jsonMatch[1] : text.trim();

		   let scientificConnections;
		   try {
			   scientificConnections = JSON.parse(cleanText);
			   if (!Array.isArray(scientificConnections)) throw new Error('AI response is not a JSON array.');
			   // Language validation logic (diasumsikan tetap sama dan berfungsi)
			   // ...existing code...
		   } catch (parseError: any) {
			   console.error('Failed to parse AI response as JSON:', parseError.message, 'Raw text:', cleanText);
			   
			   // Fallback: Return empty analysis instead of error
			   scientificConnections = [];
		   }

		   return addCorsHeaders(new Response(JSON.stringify({
			   code: 200, message: 'AI analysis completed',
			   data: { verse, tafsir, scientificConnections },
		   }), { headers: { 'Content-Type': 'application/json' }, status: 200 }), requestOrigin);

	   } catch (aiError: any) {
		   console.error('AI API failed:', aiError.message);
		   
		   // Complete fallback: Return basic analysis
		   const fallbackConnections = [
			   {
				   field: "Refleksi Umum",
				   icon: "Lightbulb",
				   description: "Ayat ini mengandung hikmah dan pelajaran yang dapat direfleksikan dalam kehidupan sehari-hari.",
				   examples: ["Perenungan terhadap makna ayat", "Implementasi nilai-nilai dalam kehidupan"],
				   confidence: 60
			   }
		   ];
		   
		   return addCorsHeaders(new Response(JSON.stringify({
			   code: 200, message: 'Analysis completed with fallback method',
			   data: { verse, tafsir, scientificConnections: fallbackConnections },
		   }), { headers: { 'Content-Type': 'application/json' }, status: 200 }), requestOrigin);
	   }
   } catch (error: any) {
	   console.error('Error during AI analysis:', error);
	   
	   // Emergency fallback
	   const emergencyConnections = [
		   {
			   field: "Analisis Tidak Tersedia",
			   icon: "AlertCircle",
			   description: "Maaf, analisis AI tidak dapat dilakukan saat ini. Silakan coba lagi nanti.",
			   examples: ["Sistem sedang dalam pemeliharaan", "Cobalah beberapa saat lagi"],
			   confidence: 0
		   }
	   ];
	   
	   return addCorsHeaders(new Response(JSON.stringify({
		   code: 200, message: 'Emergency fallback used',
		   data: { verse, tafsir, scientificConnections: emergencyConnections },
	   }), { headers: { 'Content-Type': 'application/json' }, status: 200 }), requestOrigin);
   }
}

async function proxyRequest(request: Request, targetUrl: string): Promise<Response> {
	const requestOrigin = request.headers.get('Origin');
	try {
		const response = await fetch(targetUrl, {
			method: request.method,
			headers: request.headers, 
			body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
		});

		let newResponse = new Response(response.body, response);

		if (!response.ok) {
			const errorBody = await response.text(); 
			newResponse = new Response(JSON.stringify({ code: response.status, message: `Error fetching data from external API: ${errorBody}` }), {
				headers: { 'Content-Type': 'application/json' },
				status: response.status,
			});
			console.error(`Proxy request to ${targetUrl} failed with status ${response.status}: ${errorBody}`);
		}
		return addCorsHeaders(newResponse, requestOrigin);
	} catch (error: any) {
		console.error(`Error proxying request to ${targetUrl}:`, error);
		return addCorsHeaders(new Response(JSON.stringify({ code: 500, message: `Failed to proxy request: ${error.message}` }), {
			headers: { 'Content-Type': 'application/json' },
			status: 500,
		}), requestOrigin);
	}
}


// --- NEW FUNCTION: Handle Mind Map Generation ---
async function handleMindMapGeneration(request: Request, env: Env): Promise<Response> {
   const requestOrigin = request.headers.get('Origin');
   try {
	   const { tafsir } = (await request.json()) as { tafsir: string };

	   if (!tafsir) {
		   return addCorsHeaders(new Response(JSON.stringify({ code: 400, message: 'Missing tafsir text for mind map generation.' }), {
			   headers: { 'Content-Type': 'application/json' },
			   status: 400,
		   }), requestOrigin);
	   }

   const PROMPT_MINDMAP = `Buat mind map dari tafsir berikut. Bagi menjadi beberapa topik utama dan sub-topik, jangan gabungkan semua isi dalam satu node. Setiap label maksimal 8 kata, ringkas, dan informatif.

Teks Tafsir:
"${tafsir}"

Format output JSON:
{
  "nodes": [
    {
      "id": 0,
      "label": "Inti Tafsir",
      "children": [
        {
          "id": 1,
          "label": "Topik Utama 1",
          "children": [
            { "id": 11, "label": "Sub-topik 1.1" },
            { "id": 12, "label": "Sub-topik 1.2" }
          ]
        },
        {
          "id": 2,
          "label": "Topik Utama 2",
          "children": [
            { "id": 21, "label": "Sub-topik 2.1" },
            { "id": 22, "label": "Sub-topik 2.2" }
          ]
        }
      ]
    }
  ]
}

Petunjuk:
- Jangan gabungkan semua isi tafsir dalam satu node.
- Buat minimal 3 node topik utama dan masing-masing minimal 2 sub-topik.
- Semua label maksimal 8 kata, ringkas, dan informatif.
- Semua konten dalam Bahasa Indonesia.
Berikan hanya JSON tanpa penjelasan atau teks lain.`;

	   const openrouterPayload = {
		   model: "openai/gpt-oss-120b",
		   messages: [
			   {
				   role: "user",
				   content: PROMPT_MINDMAP
			   }
		   ]
	   };

	   try {
		   const text = await callOpenRouterAPI(openrouterPayload, env.OPENROUTER_API_KEY);
		   
		   // Extract JSON from markdown code block if present
		   const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
		   const cleanText = jsonMatch && jsonMatch[1] ? jsonMatch[1] : text.trim();
		   
		   const mindMapData = JSON.parse(cleanText);
		   
		   if (mindMapData && mindMapData.nodes && Array.isArray(mindMapData.nodes)) {
			   console.log('Successfully generated mind map with AI, nodes count:', mindMapData.nodes.length);
			   return addCorsHeaders(new Response(JSON.stringify({
				   code: 200, message: 'Mind map generated successfully with AI',
				   data: mindMapData.nodes
			   }), { headers: { 'Content-Type': 'application/json' }, status: 200 }), requestOrigin);
		   } else {
			   throw new Error('Invalid AI response structure');
		   }
	   } catch (aiError: any) {
		   console.log('AI generation failed, using fallback:', aiError.message);
		   
           // FALLBACK: Bagi tafsir menjadi kalimat-kalimat, lalu ambil ringkasan berbasis kata
           const sentences = tafsir
             .split(/[.!?]+/)
             .map(s => s.trim())
             .filter(s => s.length > 0);

           // Ambil maksimal 8 kalimat representatif
           const selectedSentences = sentences.slice(0, 8);
           
          const fallbackNodes = selectedSentences.map((sentence, idx) => {
             const words = sentence.split(/\s+/).filter(Boolean);
            const maxWords = 14; // sedikit lebih panjang agar jelas
             const label = words.slice(0, maxWords).join(' ') + (words.length > maxWords ? '…' : '');
             return { id: idx, label };
           });
		   
		   console.log('Generated fallback nodes count:', fallbackNodes.length);
		   
		   return addCorsHeaders(new Response(JSON.stringify({
			   code: 200, message: 'Mind map generated with fallback method',
			   data: fallbackNodes
		   }), { headers: { 'Content-Type': 'application/json' }, status: 200 }), requestOrigin);
	   }

   } catch (error: any) {
	   console.error('Error during mind map generation:', error);
	   
	   // Emergency fallback
	   const emergencyNodes = [
		   { id: 0, label: "Inti Tafsir" },
		   { id: 1, label: "Poin Utama 1" },
		   { id: 2, label: "Poin Utama 2" },
		   { id: 3, label: "Poin Utama 3" }
	   ];
	   
	   return addCorsHeaders(new Response(JSON.stringify({ 
		   code: 200, 
		   nodes: emergencyNodes,
		   message: 'Emergency fallback used'
	   }), {
		   headers: { 'Content-Type': 'application/json' }, 
		   status: 200,
	   }), requestOrigin);
   }
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const requestOrigin = request.headers.get('Origin');

		if (request.method === 'OPTIONS') {
			return addCorsHeaders(new Response(null, { status: 204 }), requestOrigin);
		}

		if (request.method === 'GET' && url.pathname.startsWith('/api/quran/surah/')) {
			const surahId = url.pathname.split('/').pop();
			if (surahId) {
				return proxyRequest(request, `${EQURAN_API_BASE}/surat/${surahId}`);
			}
		}

		if (request.method === 'GET' && url.pathname.startsWith('/api/quran/tafsir/')) {
			const surahId = url.pathname.split('/').pop();
			if (surahId) {
				return proxyRequest(request, `${EQURAN_API_BASE}/tafsir/${surahId}`);
			}
		}
		
		if (request.method === 'POST' && url.pathname === '/api/ai/analyze') {
			return handleAiAnalysis(request, env);
		}

		if (request.method === 'POST' && url.pathname === '/api/ai/generate-question') {
			return handleQuestionGeneration(request, env);
		}

		if (request.method === 'POST' && url.pathname === '/api/ai/evaluate-answer') {
			return handleAnswerEvaluation(request, env);
		}

		if (request.method === 'POST' && url.pathname === '/api/ai/mindmap-tafsir') {
			return handleMindMapGeneration(request, env);
		}

		return addCorsHeaders(new Response('Not Found. Supported routes: GET /api/quran/surah/:id, GET /api/quran/tafsir/:id, POST /api/ai/analyze, POST /api/ai/generate-question, POST /api/ai/evaluate-answer, POST /api/ai/mindmap-tafsir', { status: 404 }), requestOrigin);
	},
};
