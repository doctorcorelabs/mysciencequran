
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Search, Lightbulb, Users, Microscope, Atom, Globe, Heart } from "lucide-react";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import AnalysisInterface from "@/components/AnalysisInterface";
import ThematicExploration from "@/components/ThematicExploration";
import PopularFindings from "@/components/PopularFindings";
import Footer from "@/components/Footer";

const Index = () => {
  const [currentSection, setCurrentSection] = useState<'home' | 'analysis' | 'exploration'>('home');

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
                  <p className="text-gray-600 text-sm">
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
                  <p className="text-gray-600 text-sm">
                    Akses mudah ke seluruh ayat Al-Quran dengan terjemahan dan transliterasi yang akurat
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Microscope className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Eksplorasi Tematik</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Jelajahi ayat berdasarkan kategori sains: Astronomi, Biologi, Fisika, dan lainnya
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-emerald-100 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <Users className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                  <CardTitle className="text-lg">Komunitas Belajar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    Bergabung dengan komunitas pelajar, mahasiswa, dan peneliti yang sama-sama mencari kebenaran
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
      
      {currentSection === 'analysis' && <AnalysisInterface />}
      {currentSection === 'exploration' && <ThematicExploration />}
      
      <Footer />
    </div>
  );
};

export default Index;
