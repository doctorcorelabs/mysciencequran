import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from '@google/genai';

export interface Env {
	GEMINI_API_KEY: string;
}

interface AIRequestBody {
	verse: {
		arabic: string;
		transliteration: string;
		translation: string;
	};
	tafsir?: string;
}

const ALLOWED_ORIGIN = 'https://mysciencequran.daivanlabs.com';
const EQURAN_API_BASE = 'https://equran.id/api/v2';

// Fungsi helper untuk menambahkan header CORS
function addCorsHeaders(response: Response): Response {
	response.headers.set('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
	response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Accept-Language');
	return response;
}

async function handleAiAnalysis(request: Request, env: Env): Promise<Response> {
	try {
		const { verse, tafsir } = (await request.json()) as AIRequestBody;

		if (!verse || (!verse.translation && !verse.arabic)) {
			return addCorsHeaders(new Response(JSON.stringify({ code: 400, message: 'Missing verse data for AI analysis.' }), {
				headers: { 'Content-Type': 'application/json' },
				status: 400,
			}));
		}
		
		const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
		const modelName = 'gemini-1.5-flash-latest';
		const callConfig = { 
			safetySettings: [
				{ category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
				{ category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
				{ category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
				{ category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
			],
			responseMimeType: 'text/plain', 
		};

		const PURE_PROMPT_TEXT = `Analisa ayat Al-Quran berikut beserta tafsirnya (jika tersedia) untuk mencari keterkaitan ilmiah. Berikan output dalam format array JSON, di mana setiap objek mewakili sebuah keterkaitan ilmiah. SELURUH KONTEN TEKS DALAM RESPONS JSON (khususnya "field", "description", dan "examples") HARUS SEPENUHNYA DALAM BAHASA INDONESIA, JANGAN MENGGUNAKAN BAHASA INGGRIS SAMA SEKALI.

Setiap objek harus memiliki kunci-kunci berikut:
- "field" (string, contoh: "Biologi Sel", "Astronomi", "Refleksi Umum") - harus dalam Bahasa Indonesia.
- "icon" (string, contoh: "Microscope", "Globe", "Atom", "Heart", "Zap", "Lightbulb", "BookOpen", "Search" - pilih nama icon Lucide-react yang paling relevan).
- "description" (string, penjelasan detail) - harus dalam Bahasa Indonesia.
- "examples" (array of strings, contoh-contoh konkret) - harus dalam Bahasa Indonesia.
- "confidence" (angka antara 0-100, untuk keterkaitan ilmiah; bisa 0 atau rendah untuk "Refleksi Umum").

Prioritas:
1.  Coba temukan keterkaitan ilmiah spesifik.
2.  Jika tidak ditemukan keterkaitan ilmiah spesifik, berikan "Refleksi Umum" atau "Kaitan Tematik Luas" terkait kebijaksanaan ayat, hubungannya dengan alam, pemahaman manusia, atau pemikiran ilmiah secara umum. Ini juga harus dalam Bahasa Indonesia dan menggunakan struktur JSON yang sama (contoh: field: "Refleksi Umum").
3.  Jika sama sekali tidak ada keterkaitan atau refleksi yang relevan, kembalikan array kosong ([]).

PENTING: Pastikan SEMUA teks yang dihasilkan untuk "field", "description", dan "examples" benar-benar dalam Bahasa Indonesia. JANGAN PERNAH MENGGUNAKAN BAHASA INGGRIS di BAGIAN MANAPUN dari konten respons. Bahkan jika ayat input dalam bahasa Inggris, analisis Anda harus sepenuhnya dalam Bahasa Indonesia. Ini sangat penting. SETIAP KATA HARUS DALAM BAHASA INDONESIA.

Verse (Arabic): ${verse.arabic || 'N/A'}
Verse (Translation): ${verse.translation || 'N/A'}
Tafsir: ${tafsir || 'N/A'}

Contoh Format Output (semua teks dalam Bahasa Indonesia):
\`\`\`json
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
\`\`\`

Berikan hanya array JSON dalam respons Anda, dibungkus dalam blok kode markdown, tanpa teks tambahan atau pemformatan markdown di luar JSON. INGAT SEMUA KONTEN HARUS DALAM BAHASA INDONESIA. JANGAN GUNAKAN BAHASA INGGRIS.`;

		const contentsForApi = [{ role: 'user', parts: [{ text: PURE_PROMPT_TEXT }] }];
		const streamResult = await ai.models.generateContentStream({ model: modelName, contents: contentsForApi, config: callConfig });

		let accumulatedText = "";
		for await (const chunk of streamResult) {
			if (chunk && chunk.text && typeof chunk.text === 'string') {
				accumulatedText += chunk.text;
			}
		}
		let text = accumulatedText;
		const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
		text = jsonMatch && jsonMatch[1] ? jsonMatch[1] : text.trim();

		let scientificConnections;
		try {
			scientificConnections = JSON.parse(text);
			if (!Array.isArray(scientificConnections)) throw new Error('AI response is not a JSON array.');
			// Language validation logic (diasumsikan tetap sama dan berfungsi)
			const commonEnglishTerms = [ /* ... */ ];
			const translations: Record<string, string> = { /* ... */ };
			const isEnglishText = (txt: string): boolean => { /* ... */ return false; };
			const translateText = (txt: string): string => { /* ... */ return txt; };
			scientificConnections = scientificConnections.map((conn: any) => { /* ... */ return conn; });

		} catch (parseError: any) {
			console.error('Failed to parse AI response as JSON:', parseError.message, 'Raw text:', text);
			return addCorsHeaders(new Response(JSON.stringify({ code: 500, message: 'AI response could not be parsed. Raw: ' + text }), {
				headers: { 'Content-Type': 'application/json' }, status: 500,
			}));
		}

		return addCorsHeaders(new Response(JSON.stringify({
			code: 200, message: 'AI analysis successful',
			data: { verse, tafsir, scientificConnections },
		}), { headers: { 'Content-Type': 'application/json' }, status: 200 }));

	} catch (error: any) {
		console.error('Error during AI analysis:', error);
		let errorMessage = error.message;
		if (error.name === 'GoogleGenerativeAIResponseError' && error.response && error.response.error) {
			errorMessage = `GoogleGenerativeAIResponseError: ${error.response.error.message} (Code: ${error.response.error.code}, Status: ${error.response.error.status})`;
		} else if (error.cause) {
			errorMessage += ` Caused by: ${JSON.stringify(error.cause)}`;
		}
		return addCorsHeaders(new Response(JSON.stringify({ code: 500, message: `AI analysis failed: ${errorMessage}` }), {
			headers: { 'Content-Type': 'application/json' }, status: 500,
		}));
	}
}

async function proxyRequest(requestUrl: string): Promise<Response> {
	try {
		const response = await fetch(requestUrl);
		if (!response.ok) {
			const errorBody = await response.text();
			console.error(`Proxy request to ${requestUrl} failed with status ${response.status}: ${errorBody}`);
			return addCorsHeaders(new Response(JSON.stringify({ code: response.status, message: `Error fetching data from external API: ${errorBody}` }), {
				headers: { 'Content-Type': 'application/json' },
				status: response.status,
			}));
		}
		const data = await response.json();
		return addCorsHeaders(new Response(JSON.stringify(data), {
			headers: { 'Content-Type': 'application/json' },
			status: 200,
		}));
	} catch (error: any) {
		console.error(`Error proxying request to ${requestUrl}:`, error);
		return addCorsHeaders(new Response(JSON.stringify({ code: 500, message: `Failed to proxy request: ${error.message}` }), {
			headers: { 'Content-Type': 'application/json' },
			status: 500,
		}));
	}
}


export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		// Handle preflight request (OPTIONS)
		if (request.method === 'OPTIONS') {
			return addCorsHeaders(new Response(null, { status: 204 }));
		}

		// Routing
		if (request.method === 'GET' && url.pathname.startsWith('/api/quran/surah/')) {
			const surahId = url.pathname.split('/').pop();
			if (surahId) {
				return proxyRequest(`${EQURAN_API_BASE}/surat/${surahId}`);
			}
		}

		if (request.method === 'GET' && url.pathname.startsWith('/api/quran/tafsir/')) {
			const surahId = url.pathname.split('/').pop();
			if (surahId) {
				return proxyRequest(`${EQURAN_API_BASE}/tafsir/${surahId}`);
			}
		}
		
		if (request.method === 'POST' && url.pathname === '/api/ai/analyze') {
			return handleAiAnalysis(request, env);
		}

		return addCorsHeaders(new Response('Not Found. Supported routes: GET /api/quran/surah/:id, GET /api/quran/tafsir/:id, POST /api/ai/analyze', { status: 404 }));
	},
};
