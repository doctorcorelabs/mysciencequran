import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Lightbulb, BookOpen, Microscope, Globe, Atom, Heart, Zap } from "lucide-react";
import QuranChatbot from "@/components/QuranChatbot";

// Map icon names from backend to Lucide-react components
const iconMap: { [key: string]: React.ElementType } = {
  Microscope: Microscope,
  Globe: Globe,
  Atom: Atom,
  Heart: Heart,
  Zap: Zap,
  Lightbulb: Lightbulb,
  BookOpen: BookOpen,
  Search: Search,
};

// Use relative URLs to avoid CORS issues
// In production, API will be served from same domain via Netlify redirects
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8787');

const AnalysisInterface = () => {
  const [inputText, setInputText] = useState("");
  const [selectedSurah, setSelectedSurah] = useState("");
  const [selectedAyah, setSelectedAyah] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surahList, setSurahList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("reference");
  const surahSelectContentRef = useRef<HTMLDivElement>(null);

  // New state for interactive Q&A
  const [generatedQuestion, setGeneratedQuestion] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>("");
  const [evaluationResult, setEvaluationResult] = useState<{ feedback: string; score: number } | null>(null);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState<boolean>(false);
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = useState<boolean>(false);
  const [interactionError, setInteractionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahList = async () => {
      try {
        const response = await fetch('https://equran.id/api/v2/surat');
        const data = await response.json();
        if (data.code === 200 && data.data) {
          setSurahList(data.data);
        } else {
          console.error("Failed to fetch surah list:", data.message);
          setError("Gagal mengambil daftar surah.");
        }
      } catch (err: any) {
        console.error("Error fetching surah list:", err.message);
        setError(`Gagal mengambil daftar surah: ${err.message}`);
      }
    };
    fetchSurahList();
  }, []);

  const fetchGeneratedQuestion = async (contextText: string) => {
    setIsGeneratingQuestion(true);
    setInteractionError(null);
    setGeneratedQuestion(null);
    setEvaluationResult(null);
    setUserAnswer("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/generate-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextText }),
      });
      const result = await response.json();
      if (response.ok && result.code === 200 && result.question) {
        setGeneratedQuestion(result.question);
      } else {
        setInteractionError(result.message || "Gagal menghasilkan pertanyaan.");
        setGeneratedQuestion(null);
      }
    } catch (err: any) {
      console.error("Error fetching generated question:", err.message);
      setInteractionError(`Gagal menghasilkan pertanyaan: ${err.message}`);
      setGeneratedQuestion(null);
    } finally {
      setIsGeneratingQuestion(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!generatedQuestion || !userAnswer) {
      setInteractionError("Pertanyaan atau jawaban tidak boleh kosong.");
      return;
    }
    setIsEvaluatingAnswer(true);
    setInteractionError(null);
    setEvaluationResult(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/evaluate-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: generatedQuestion, userAnswer }),
      });
      const result = await response.json();
      if (response.ok && result.code === 200) {
        setEvaluationResult({ feedback: result.feedback, score: result.score });
      } else {
        setInteractionError(result.message || "Gagal mengevaluasi jawaban.");
      }
    } catch (err: any) {
      console.error("Error evaluating answer:", err.message);
      setInteractionError(`Gagal mengevaluasi jawaban: ${err.message}`);
    } finally {
      setIsEvaluatingAnswer(false);
    }
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    // Reset interactive Q&A state
    setGeneratedQuestion(null);
    setUserAnswer("");
    setEvaluationResult(null);
    setInteractionError(null);


    let verseData = null;
    let tafsirData = null;

    if (activeTab === "reference") {
      if (!selectedSurah || !selectedAyah) {
        setError("Mohon pilih Surah dan masukkan Nomor Ayat.");
        setIsAnalyzing(false);
        return;
      }
      try {
        // Fetch surah details and verses from backend proxy
        const surahResponse = await fetch(`${API_BASE_URL}/api/quran/surah/${selectedSurah}`);
        const surahData = await surahResponse.json();

        if (surahData.code === 200 && surahData.data) {
          const ayah = surahData.data.ayat.find((a: any) => a.nomorAyat === parseInt(selectedAyah));
          if (ayah) {
            verseData = {
              arabic: ayah.teksArab,
              transliteration: ayah.teksLatin,
              translation: ayah.teksIndonesia,
              audioUrl: ayah.audio && ayah.audio["05"] ? ayah.audio["05"] : null, // Mengambil audio Misyari Rasyid
            };
          } else {
            setError("Ayat tidak ditemukan dalam surah ini.");
          }
        } else {
          setError("Surah tidak ditemukan atau terjadi kesalahan.");
        }

        // Fetch tafsir from backend proxy
        const tafsirResponse = await fetch(`${API_BASE_URL}/api/quran/tafsir/${selectedSurah}`);
        const tafsirResData = await tafsirResponse.json();

        if (tafsirResData.code === 200 && tafsirResData.data) {
          const ayahTafsir = tafsirResData.data.tafsir.find((t: any) => t.ayat === parseInt(selectedAyah));
          if (ayahTafsir) {
            tafsirData = ayahTafsir.teks;
          }
        }

      } catch (err: any) {
        console.error("Error fetching verse or tafsir:", err.message);
        setError(`Gagal mengambil ayat atau tafsir: ${err.message}`);
      }
    } else if (activeTab === "translation") {
      if (!inputText) {
        setError("Mohon masukkan terjemahan ayat Al-Quran.");
        setIsAnalyzing(false);
        return;
      }
      verseData = {
        arabic: "Teks Arab (dari input terjemahan)", // Placeholder, AI will analyze translation
        transliteration: "Transliterasi (dari input terjemahan)", // Placeholder
        translation: inputText,
      };
    } else {
      setError("Mohon masukkan terjemahan atau nomor surah dan ayat.");
      setIsAnalyzing(false);
      return;
    }

    if (verseData) {
      // Prepare data for AI analysis
      const aiInput = {
        verse: verseData,
        tafsir: tafsirData,
      };

      try {
        // Use backend proxy for AI analysis
        const aiResponse = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept-Language': 'id-ID', // Explicitly request Indonesian content
          },
          body: JSON.stringify({
            ...aiInput,
            language: 'id' // Explicitly request Indonesian language
          }),
        });
        const aiResult = await aiResponse.json();

        if (aiResult.code === 200 && aiResult.data) {
          // Function to detect English text
          const isEnglishText = (text: string): boolean => {
            if (!text) return false;
            
            const englishPatterns = [
              /\bthe\b/i, /\band\b/i, /\bof\b/i, /\bis\b/i, /\bin\b/i, /\bto\b/i, /\bthat\b/i,
              /\bfor\b/i, /\bwith\b/i, /\bas\b/i, /\bon\b/i, /\bat\b/i, /\bby\b/i, /\bfrom\b/i,
              /\bare\b/i, /\bthis\b/i, /\bwill\b/i, /\bhave\b/i, /\bor\b/i, /\bnot\b/i, /\bbut\b/i,
              /\bwhat\b/i, /\bverse\b/i, /\bsaid\b/i, /\bwhen\b/i, /\bcan\b/i, /\btheir\b/i, /\byour\b/i, 
              /\sdiscusses\s/i, /\stouches\s/i, /\sexplores\s/i, /\shighlights\s/i, /\simplies\s/i
            ];
            
            let englishPatternCount = 0;
            for (const pattern of englishPatterns) {
              if (pattern.test(text)) {
                englishPatternCount++;
                if (englishPatternCount >= 3) return true; 
              }
            }
            
            return false;
          };

          const translationDict: {[key: string]: string} = {
            "Psychology": "Psikologi", "Political Science": "Ilmu Politik", "Biology": "Biologi",
            "Chemistry": "Kimia", "Physics": "Fisika", "Astronomy": "Astronomi", "Medicine": "Kedokteran",
            "Geology": "Geologi", "Sociology": "Sosiologi", "Decision Making": "Pengambilan Keputusan",
            "General Reflection": "Refleksi Umum", "Ethics": "Etika", "Philosophy": "Filsafat",
            "Neuroscience": "Neurosains", "Environmental Science": "Ilmu Lingkungan", "Mathematics": "Matematika",
            "History": "Sejarah", "The verse discusses": "Ayat ini membahas", "The verse touches upon": "Ayat ini menyentuh tentang",
            "The verse explores": "Ayat ini mengeksplorasi", "The verse highlights": "Ayat ini menyoroti",
            "This relates to": "Ini berkaitan dengan", "This connects to": "Ini terhubung dengan",
            "cognitive dissonance": "disonansi kognitif", "decision-making": "pengambilan keputusan",
            "emotional regulation": "regulasi emosi", "justifications for war": "pembenaran untuk perang",
            "international relations": "hubungan internasional", "societal implications": "implikasi sosial",
            "warfare": "peperangan", "conflict resolution": "resolusi konflik",
            "military strategies": "strategi militer", "humanitarian aid": "bantuan kemanusiaan"
          };
          
          const translateEnglishPhrases = (text: string): string => {
            if (!text) return text;
            let translatedText = text;
            Object.entries(translationDict).forEach(([english, indonesian]) => {
              translatedText = translatedText.replace(new RegExp(english, 'gi'), indonesian);
            });
            return translatedText;
          };

          const processedConnections = aiResult.data.scientificConnections.map((conn: any) => {
            let field = conn.field;
            let description = conn.description;
            let examples = conn.examples || [];
            
            if (translationDict[field]) field = translationDict[field];
            if (isEnglishText(description)) description = translateEnglishPhrases(description);
            examples = examples.map((example: string) => isEnglishText(example) ? translateEnglishPhrases(example) : example);
            
            return {
              ...conn, field, description, examples,
              icon: iconMap[conn.icon] ? React.createElement(iconMap[conn.icon], { className: "w-6 h-6" }) : React.createElement(Lightbulb, { className: "w-6 h-6" })
            };
          });
          
          setAnalysisResult({
            verse: { ...aiResult.data.verse, audioUrl: verseData?.audioUrl },
            scientificConnections: processedConnections,
            tafsir: tafsirData, 
          });

          if (processedConnections && processedConnections.length > 0 && processedConnections[0].description) {
            fetchGeneratedQuestion(processedConnections[0].description);
          } else {
            setGeneratedQuestion(null); 
          }
        } else {
          setError(aiResult.message || "Gagal melakukan analisis AI.");
        }
      } catch (err: any) {
        console.error("Error during AI analysis:", err.message);
        setError(`Gagal melakukan analisis AI: ${err.message}`);
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Analisis AI: Al-Quran & Sains</h2>
        <p className="text-lg text-gray-600">
          Masukkan ayat Al-Quran dan biarkan AI menganalisis keterkaitan ilmiahnya
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
              Input Ayat Al-Quran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="reference" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="translation">Terjemahan</TabsTrigger>
                <TabsTrigger value="reference">Surah & Ayat</TabsTrigger>
              </TabsList>
              
              <TabsContent value="translation" className="space-y-4">
                <Textarea
                  placeholder="Masukkan terjemahan ayat Al-Quran yang ingin dianalisis..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-32 border-emerald-200 focus:border-emerald-400"
                />
              </TabsContent>
              
              <TabsContent value="reference" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select 
                    onValueChange={setSelectedSurah} 
                    value={selectedSurah}
                    onOpenChange={(isOpen) => {
                      if (isOpen && surahSelectContentRef.current) {
                        setTimeout(() => {
                          if (surahSelectContentRef.current) {
                            surahSelectContentRef.current.scrollTop = 0;
                          }
                        }, 0);
                      }
                    }}
                  >
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                      <SelectValue placeholder="Pilih Surah" />
                    </SelectTrigger>
                    <SelectContent 
                      ref={surahSelectContentRef}
                      sideOffset={5} 
                      collisionPadding={10} 
                      avoidCollisions={true} 
                    >
                      {surahList.map((surah) => (
                        <SelectItem key={surah.nomor} value={String(surah.nomor)}>
                          {surah.nomor}. {surah.namaLatin} ({surah.jumlahAyat} ayat)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Nomor Ayat"
                    type="number"
                    value={selectedAyah}
                    onChange={(e) => setSelectedAyah(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <Button 
              onClick={handleAnalysis}
              disabled={
                (activeTab === "translation" && !inputText) || 
                (activeTab === "reference" && (!selectedSurah || !selectedAyah)) || 
                isAnalyzing
              }
              className="w-full mt-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
            >
              {isAnalyzing ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Analisis dengan AI
                </>
              )}
            </Button>

            {/* Interactive Q&A Section (LG screens) */}
            {analysisResult && (
              <div className="hidden lg:block mt-6">
                {isGeneratingQuestion && (
                  <div className="text-center py-6">
                    <div className="animate-spin w-6 h-6 border-3 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Menghasilkan pertanyaan refleksi...</p>
                  </div>
                )}

                {analysisResult && generatedQuestion && !isGeneratingQuestion && (
                  <>
                    <Separator className="my-6" />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Pertanyaan Refleksi:</h4>
                      <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                          <p className="text-gray-800 mb-4 text-justify">{generatedQuestion}</p>
                          <Textarea
                            placeholder="Masukkan jawaban Anda di sini..."
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            className="min-h-24 border-blue-300 focus:border-blue-500 mb-3"
                          />
                          <Button
                            onClick={handleAnswerSubmit}
                            disabled={isEvaluatingAnswer || !userAnswer.trim()}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {isEvaluatingAnswer ? (
                              <>
                                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                                Mengevaluasi...
                              </>
                            ) : (
                              "Kirim Jawaban"
                            )}
                          </Button>
                          {interactionError && <p className="text-red-500 text-sm mt-2">{interactionError}</p>}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {evaluationResult && !isEvaluatingAnswer && (
                  <div className="mt-4">
                    <h5 className="text-md font-semibold text-gray-900 mb-2">Evaluasi Jawaban Anda:</h5>
                    <Card className="border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <p className="text-gray-700 text-sm mb-2 text-justify">{evaluationResult.feedback}</p>
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-600 mr-2">Skor:</p>
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i} 
                              className={`w-5 h-5 ${i < evaluationResult.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                           <span className="ml-2 text-sm text-gray-700">({evaluationResult.score}/5)</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="w-5 h-5 mr-2 text-emerald-600" />
              Hasil Analisis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!analysisResult && !isAnalyzing && (
              <div className="text-center py-12 text-gray-500">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>Masukkan ayat untuk memulai analisis AI</p>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">AI sedang menganalisis keterkaitan ilmiah...</p>
              </div>
            )}
            
            {analysisResult && (
              <div className="space-y-6">
                {/* Verse Display */}
                <div className="bg-emerald-50 rounded-lg p-6">
                  <div className="text-right mb-4">
                    <p className="text-2xl font-arabic text-gray-800 leading-loose">
                      {analysisResult.verse.arabic}
                    </p>
                  </div>
                  <div className="mb-2">
                    <p className="text-emerald-700 italic">{analysisResult.verse.transliteration}</p>
                  </div>
                  <p className="text-gray-800 font-medium text-justify">{analysisResult.verse.translation}</p>
                  {analysisResult.verse.audioUrl && (
                    <div className="mt-4">
                      <audio controls src={analysisResult.verse.audioUrl} className="w-full">
                        Browser Anda tidak mendukung elemen audio.
                      </audio>
                    </div>
                  )}
                </div>

                {/* Tafsir Display */}
                {analysisResult.tafsir && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Tafsir Ayat:</h4>
                      <Card className="border-gray-200 bg-white">
                        <CardContent className="p-4">
                          <p className="text-gray-700 text-sm whitespace-pre-line text-justify">{analysisResult.tafsir}</p>
                          {/* Link to Eksplorasi Tafsir removed */}
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
                
                <Separator />
                
                {/* Scientific Connections */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 mt-4">Keterkaitan Ilmiah & Refleksi:</h4>
                  {analysisResult.scientificConnections && analysisResult.scientificConnections.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResult.scientificConnections.map((connection: any, index: number) => (
                        <Card key={index} className="border-gray-200">
                          <CardContent className="p-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                {connection.icon}
                              </div>
                              <div className="flex-grow">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-semibold text-gray-900">{connection.field}</h5>
                                  {typeof connection.confidence === 'number' && connection.confidence > 0 && (
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                      {connection.confidence}% relevan
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-700 text-sm mb-3 text-justify">{connection.description}</p>
                                {connection.examples && connection.examples.length > 0 && (
                                  <div className="space-y-1">
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Contoh:</p>
                                    {connection.examples.map((example: string, exIndex: number) => (
                                      <p key={exIndex} className="text-xs text-gray-600 text-justify">• {example}</p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Zap className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-justify">Tidak ditemukan keterkaitan ilmiah spesifik maupun refleksi umum untuk ayat ini.</p>
                    </div>
                  )}
                </div>

                {/* Interactive Q&A Section (SM screens) */}
                <div className="block lg:hidden mt-6">
                  {isGeneratingQuestion && (
                    <div className="text-center py-6">
                      <div className="animate-spin w-6 h-6 border-3 border-blue-200 border-t-blue-500 rounded-full mx-auto mb-2"></div>
                      <p className="text-sm text-gray-500">Menghasilkan pertanyaan refleksi...</p>
                    </div>
                  )}

                  {analysisResult && generatedQuestion && !isGeneratingQuestion && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Pertanyaan Refleksi:</h4>
                        <Card className="border-blue-200 bg-blue-50">
                          <CardContent className="p-4">
                            <p className="text-gray-800 mb-4 text-justify">{generatedQuestion}</p>
                            <Textarea
                              placeholder="Masukkan jawaban Anda di sini..."
                              value={userAnswer}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              className="min-h-24 border-blue-300 focus:border-blue-500 mb-3"
                            />
                            <Button
                              onClick={handleAnswerSubmit}
                              disabled={isEvaluatingAnswer || !userAnswer.trim()}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                              {isEvaluatingAnswer ? (
                                <>
                                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                                  Mengevaluasi...
                                </>
                              ) : (
                                "Kirim Jawaban"
                              )}
                            </Button>
                            {interactionError && <p className="text-red-500 text-sm mt-2">{interactionError}</p>}
                          </CardContent>
                        </Card>
                      </div>
                    </>
                  )}

                  {evaluationResult && !isEvaluatingAnswer && (
                    <div className="mt-4">
                      <h5 className="text-md font-semibold text-gray-900 mb-2">Evaluasi Jawaban Anda:</h5>
                      <Card className="border-green-200 bg-green-50">
                        <CardContent className="p-4">
                          <p className="text-gray-700 text-sm mb-2 text-justify">{evaluationResult.feedback}</p>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-600 mr-2">Skor:</p>
                            {[...Array(5)].map((_, i) => (
                              <StarIcon 
                                key={i} 
                                className={`w-5 h-5 ${i < evaluationResult.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                             <span className="ml-2 text-sm text-gray-700">({evaluationResult.score}/5)</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
                {/* End Interactive Q&A Section */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Chatbot with Analysis Context */}
      {analysisResult && (
        <QuranChatbot
          analysisContext={{
            verse: analysisResult.verse,
            surahNumber: selectedSurah,
            ayahNumber: selectedAyah,
            tafsir: analysisResult.tafsir,
            scientificConnections: analysisResult.scientificConnections
          }}
        />
      )}
      
      {/* Chatbot without context when no analysis */}
      {!analysisResult && <QuranChatbot />}
    </div>
  );
};

// Helper Star Icon component (can be moved to a separate ui file if preferred)
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default AnalysisInterface;
