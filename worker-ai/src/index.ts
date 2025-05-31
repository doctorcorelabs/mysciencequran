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

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);

		if (request.method === 'POST' && url.pathname === '/analyze-ai') {
			try {
				const { verse, tafsir } = (await request.json()) as AIRequestBody;

				if (!verse || (!verse.translation && !verse.arabic)) {
					return new Response(JSON.stringify({ code: 400, message: 'Missing verse data for AI analysis.' }), {
						headers: { 'Content-Type': 'application/json' },
						status: 400,
					});
				}
				
				// Always enforce Indonesian language preference
				const preferredLanguage = 'id';

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

        const contentsForApi = [
          {
            role: 'user',
            parts: [{ text: PURE_PROMPT_TEXT }],
          },
        ];
        
        const streamResult = await ai.models.generateContentStream({
          model: modelName,
          contents: contentsForApi,
          config: callConfig, 
        });

        let accumulatedText = "";
        for await (const chunk of streamResult) {
            // Access chunk.text directly as it's a getter property
            if (chunk && chunk.text && typeof chunk.text === 'string') {
                 accumulatedText += chunk.text;
            }
        }
				let text = accumulatedText;

				const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
				if (jsonMatch && jsonMatch[1]) {
					text = jsonMatch[1];
				} else {
					text = text.trim(); 
				}

				let scientificConnections;
				try {
					scientificConnections = JSON.parse(text);
					if (!Array.isArray(scientificConnections)) {
						throw new Error('AI response is not a JSON array.');
					}

          // Validate and enforce Indonesian language in all responses
          const commonEnglishTerms = [
            "Psychology", "Biology", "Physics", "Chemistry", "Astronomy",
            "Geology", "Sociology", "Philosophy", "Mathematics", "Decision Making",
            "Reflection", "Medicine", "Theology", "the", "and", "of", "in", "with", "for",
            "Political Science", "Ethics", "Neuroscience", "Environmental Science", "History",
            "discusses", "touches", "explores", "highlights", "implies", "This relates to"
          ];
          
          // Translations dictionary - expanded with more terms
          const translations: Record<string, string> = {
            // Scientific fields
            "Psychology": "Psikologi",
            "Biology": "Biologi",
            "Physics": "Fisika",
            "Chemistry": "Kimia", 
            "Astronomy": "Astronomi",
            "Geology": "Geologi",
            "Sociology": "Sosiologi",
            "Philosophy": "Filsafat",
            "Mathematics": "Matematika",
            "Medicine": "Kedokteran",
            "Decision Making": "Pengambilan Keputusan",
            "General Reflection": "Refleksi Umum",
            "Political Science": "Ilmu Politik",
            "Ethics": "Etika",
            "Neuroscience": "Neurosains",
            "Environmental Science": "Ilmu Lingkungan",
            "History": "Sejarah",
            
            // Common English phrases
            "The verse discusses": "Ayat ini membahas",
            "The verse touches upon": "Ayat ini menyentuh tentang",
            "The verse explores": "Ayat ini mengeksplorasi",
            "The verse highlights": "Ayat ini menyoroti",
            "The verse implies": "Ayat ini menyiratkan",
            "This relates to": "Ini berkaitan dengan",
            "cognitive dissonance": "disonansi kognitif",
            "decision-making": "pengambilan keputusan",
            "emotional regulation": "regulasi emosi",
            "warfare": "peperangan",
            "conflict resolution": "resolusi konflik"
          };
          
          // Function to detect English text
          const isEnglishText = (text: string): boolean => {
            if (!text) return false;
            const englishPatterns = [/\bthe\b/i, /\band\b/i, /\bof\b/i, /\bis\b/i, /\bin\b/i, /\bto\b/i, /\bdiscusses\b/i];
            let matchCount = 0;
            for (const pattern of englishPatterns) {
              if (pattern.test(text)) matchCount++;
              if (matchCount >= 2) return true;
            }
            return false;
          };
          
          // Function to translate English text
          const translateText = (text: string): string => {
            if (!text) return text;
            let translatedText = text;
            
            Object.entries(translations).forEach(([eng, id]) => {
              translatedText = translatedText.replace(new RegExp(eng, 'gi'), id);
            });
            
            return translatedText;
          };

          // Enforce Indonesian in each connection
          scientificConnections = scientificConnections.map((conn: any) => {
            // Check and translate field if needed
            if (conn.field && commonEnglishTerms.some(term => conn.field.includes(term))) {
              if (translations[conn.field]) {
                conn.field = translations[conn.field];
              } else {
                conn.field = translateText(conn.field);
              }
            }
            
            // Check and translate description
            if (conn.description && isEnglishText(conn.description)) {
              conn.description = translateText(conn.description);
            }
            
            // Check and translate examples
            if (conn.examples && Array.isArray(conn.examples)) {
              conn.examples = conn.examples.map((example: string) => {
                if (isEnglishText(example)) {
                  return translateText(example);
                }
                return example;
              });
            }
            
            return conn;
          });
				} catch (parseError: any) {
					console.error('Failed to parse AI response as JSON:', parseError.message, 'Raw text:', text);
					return new Response(JSON.stringify({ code: 500, message: 'AI response could not be parsed. Raw: ' + text }), {
						headers: { 'Content-Type': 'application/json' },
						status: 500,
					});
				}

				return new Response(JSON.stringify({
					code: 200,
					message: 'AI analysis successful',
					data: {
						verse: verse,
						tafsir: tafsir,
						scientificConnections: scientificConnections,
					},
				}), {
					headers: { 'Content-Type': 'application/json' },
					status: 200,
				});

			} catch (error: any) {
				console.error('Error during AI analysis:', error);
        let errorMessage = error.message;
        if (error.name === 'GoogleGenerativeAIResponseError' && error.response && error.response.error) {
            errorMessage = `GoogleGenerativeAIResponseError: ${error.response.error.message} (Code: ${error.response.error.code}, Status: ${error.response.error.status})`;
        } else if (error.cause) {
          errorMessage += ` Caused by: ${JSON.stringify(error.cause)}`;
        }
				return new Response(JSON.stringify({ code: 500, message: `AI analysis failed: ${errorMessage}` }), {
					headers: { 'Content-Type': 'application/json' },
					status: 500,
				});
			}
		}

		return new Response('Not Found', { status: 404 });
	},
};
