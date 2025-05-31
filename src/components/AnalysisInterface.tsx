
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Lightbulb, BookOpen, Microscope, Globe, Atom, Heart, Zap } from "lucide-react";

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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const AnalysisInterface = () => {
  const [inputText, setInputText] = useState("");
  const [selectedSurah, setSelectedSurah] = useState("");
  const [selectedAyah, setSelectedAyah] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [surahList, setSurahList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("reference");

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

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

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
            
            // Common English words/patterns that should not appear in Indonesian content
            const englishPatterns = [
              /\bthe\b/i, /\band\b/i, /\bof\b/i, /\bis\b/i, /\bin\b/i, /\bto\b/i, /\bthat\b/i,
              /\bfor\b/i, /\bwith\b/i, /\bas\b/i, /\bon\b/i, /\bat\b/i, /\bby\b/i, /\bfrom\b/i,
              /\bare\b/i, /\bthis\b/i, /\bwill\b/i, /\bhave\b/i, /\bor\b/i, /\bnot\b/i, /\bbut\b/i,
              /\bwhat\b/i, /\bverse\b/i, /\bsaid\b/i, /\bwhen\b/i, /\bcan\b/i, /\btheir\b/i, /\byour\b/i, 
              /\sdiscusses\s/i, /\stouches\s/i, /\sexplores\s/i, /\shighlights\s/i, /\simplies\s/i
            ];
            
            // If multiple English patterns are found, likely English text
            let englishPatternCount = 0;
            for (const pattern of englishPatterns) {
              if (pattern.test(text)) {
                englishPatternCount++;
                if (englishPatternCount >= 3) return true; // If 3+ English patterns found, consider it English
              }
            }
            
            return false;
          };

          // Dictionary for English-Indonesian terms and common phrases
          const translationDict: {[key: string]: string} = {
            // Fields
            "Psychology": "Psikologi",
            "Political Science": "Ilmu Politik",
            "Biology": "Biologi",
            "Chemistry": "Kimia",
            "Physics": "Fisika",
            "Astronomy": "Astronomi",
            "Medicine": "Kedokteran",
            "Geology": "Geologi",
            "Sociology": "Sosiologi",
            "Decision Making": "Pengambilan Keputusan",
            "General Reflection": "Refleksi Umum",
            "Ethics": "Etika",
            "Philosophy": "Filsafat",
            "Neuroscience": "Neurosains",
            "Environmental Science": "Ilmu Lingkungan",
            "Mathematics": "Matematika",
            "History": "Sejarah",
            
            // Common English phrases in descriptions
            "The verse discusses": "Ayat ini membahas",
            "The verse touches upon": "Ayat ini menyentuh tentang",
            "The verse explores": "Ayat ini mengeksplorasi",
            "The verse highlights": "Ayat ini menyoroti",
            "This relates to": "Ini berkaitan dengan",
            "This connects to": "Ini terhubung dengan",
            "cognitive dissonance": "disonansi kognitif",
            "decision-making": "pengambilan keputusan",
            "emotional regulation": "regulasi emosi",
            "justifications for war": "pembenaran untuk perang",
            "international relations": "hubungan internasional",
            "societal implications": "implikasi sosial",
            "warfare": "peperangan",
            "conflict resolution": "resolusi konflik",
            "military strategies": "strategi militer",
            "humanitarian aid": "bantuan kemanusiaan"
          };
          
          // Function to translate English text to Indonesian using dictionary
          const translateEnglishPhrases = (text: string): string => {
            if (!text) return text;
            let translatedText = text;
            
            // Replace known phrases
            Object.entries(translationDict).forEach(([english, indonesian]) => {
              translatedText = translatedText.replace(new RegExp(english, 'gi'), indonesian);
            });
            
            return translatedText;
          };

          // Process scientific connections to ensure Indonesian language and proper formatting
          const processedConnections = aiResult.data.scientificConnections.map((conn: any) => {
            // Ensure field is in Indonesian
            let field = conn.field;
            let description = conn.description;
            let examples = conn.examples || [];
            
            // Translate field if it's in English
            if (translationDict[field]) {
              field = translationDict[field];
            }
            
            // Check if description is in English and translate it
            if (isEnglishText(description)) {
              description = translateEnglishPhrases(description);
            }
            
            // Translate examples if they're in English
            examples = examples.map((example: string) => {
              if (isEnglishText(example)) {
                return translateEnglishPhrases(example);
              }
              return example;
            });
            
            return {
              ...conn,
              field: field,
              description: description,
              examples: examples,
              icon: iconMap[conn.icon] ? React.createElement(iconMap[conn.icon], { className: "w-6 h-6" }) : null
            };
          });
          
          setAnalysisResult({
            verse: { 
              ...aiResult.data.verse, 
              audioUrl: verseData?.audioUrl, 
            },
            scientificConnections: processedConnections,
            tafsir: tafsirData, 
          });
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
                  <Select onValueChange={setSelectedSurah} value={selectedSurah}>
                    <SelectTrigger className="border-emerald-200 focus:border-emerald-400">
                      <SelectValue placeholder="Pilih Surah" />
                    </SelectTrigger>
                    <SelectContent>
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

                {/* Tafsir Display (BARU) */}
                {analysisResult.tafsir && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mt-4 mb-2">Tafsir Ayat:</h4>
                      <Card className="border-gray-200 bg-white">
                        <CardContent className="p-4">
                          <p className="text-gray-700 text-sm whitespace-pre-line text-justify">{analysisResult.tafsir}</p>
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisInterface;
