
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Search, Lightbulb, BookOpen, Microscope, Globe, Atom, Heart, Zap } from "lucide-react";

const AnalysisInterface = () => {
  const [inputText, setInputText] = useState("");
  const [selectedSurah, setSelectedSurah] = useState("");
  const [selectedAyah, setSelectedAyah] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      setAnalysisResult({
        verse: {
          arabic: "وَجَعَلْنَا مِنَ الْمَآءِ كُلَّ شَىْءٍ حَىٍّ ۗ اَفَلَا يُؤْمِنُوْنَ",
          transliteration: "Wa ja'alna minal ma'i kulla syay'in hayy, afala yu'minun",
          translation: inputText || "Dan Kami jadikan dari air segala sesuatu yang hidup. Maka mengapakah mereka tiada juga beriman?"
        },
        scientificConnections: [
          {
            field: "Biologi Sel",
            icon: <Microscope className="w-6 h-6" />,
            description: "Sekitar 60-70% tubuh manusia terdiri dari air. Setiap sel memerlukan air untuk fungsi metabolisme dasar.",
            examples: [
              "Transport nutrisi melalui membran sel",
              "Reaksi biokimia dalam sitoplasma",
              "Regulasi suhu tubuh melalui keringat"
            ],
            confidence: 95
          },
          {
            field: "Evolusi & Asal Usul Kehidupan",
            icon: <Globe className="w-6 h-6" />,
            description: "Teori ilmiah modern menunjukkan bahwa kehidupan pertama kali muncul di lingkungan berair.",
            examples: [
              "Fosil mikroorganisme tertua ditemukan di formasi batuan akuatik",
              "Sintesis molekul organik kompleks memerlukan medium air",
              "Semua proses evolusi awal terjadi di lautan primordial"
            ],
            confidence: 88
          },
          {
            field: "Kimia Organik",
            icon: <Atom className="w-6 h-6" />,
            description: "Air adalah pelarut universal yang memungkinkan reaksi kimia essential untuk kehidupan.",
            examples: [
              "Hidrolisis untuk pemecahan molekul kompleks",
              "Fotosintesis menggunakan air sebagai sumber elektron",
              "Pembentukan ikatan hidrogen dalam protein dan DNA"
            ],
            confidence: 92
          }
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
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
            <Tabs defaultValue="translation">
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
                  <Input
                    placeholder="Nama Surah"
                    value={selectedSurah}
                    onChange={(e) => setSelectedSurah(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                  <Input
                    placeholder="Nomor Ayat"
                    value={selectedAyah}
                    onChange={(e) => setSelectedAyah(e.target.value)}
                    className="border-emerald-200 focus:border-emerald-400"
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <Button 
              onClick={handleAnalysis}
              disabled={!inputText && (!selectedSurah || !selectedAyah) || isAnalyzing}
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
                  <p className="text-gray-800 font-medium">{analysisResult.verse.translation}</p>
                </div>
                
                <Separator />
                
                {/* Scientific Connections */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Keterkaitan Ilmiah:</h4>
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
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                  {connection.confidence}% relevan
                                </Badge>
                              </div>
                              <p className="text-gray-700 text-sm mb-3">{connection.description}</p>
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Contoh:</p>
                                {connection.examples.map((example: string, exIndex: number) => (
                                  <p key={exIndex} className="text-xs text-gray-600">• {example}</p>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
