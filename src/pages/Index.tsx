
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Lightbulb, Users, Microscope, Atom, Globe, Heart, AudioLines, ShieldCheck } from "lucide-react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AnalysisInterface from "@/components/AnalysisInterface";
import PopularFindings from "@/components/PopularFindings";
import Footer from "@/components/Footer";

const Index = () => {
  const [currentSection, setCurrentSection] = useState<'home' | 'analysis'>('home');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <Navigation currentSection={currentSection} setCurrentSection={setCurrentSection} />
      
      {currentSection === 'home' && (
        <>
          <HeroSection setCurrentSection={setCurrentSection} />
          <PopularFindings />
          <div className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Mengapa MyScienceQuran?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Platform inovatif yang memadukan kearifan Al-Quran dengan penemuan sains modern
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Lightbulb className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Analisis AI Canggih</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm text-justify">
                    Teknologi AI menganalisis makna ayat dan mengidentifikasi keterkaitan dengan konsep ilmiah modern
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <BookOpen className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Database Lengkap</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm text-justify">
                    Akses mudah ke seluruh ayat Al-Quran dengan terjemahan dan transliterasi yang akurat
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <AudioLines className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Audio Murottal & Tafsir Ayat</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm text-justify">
                    Tersedia fitur audio murottal untuk setiap ayat beserta penjelasan tafsirnya.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Sumber Terpercaya</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm text-justify">
                    Menggunakan data Al-Quran dan terjemahan resmi dari Kementerian Agama (Kemenag) Republik Indonesia.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
      
      {currentSection === 'analysis' && <AnalysisInterface />}
      
      <Footer />
    </div>
  );
};

export default Index;
