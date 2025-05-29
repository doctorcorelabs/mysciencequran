
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, BookOpen, Lightbulb } from "lucide-react";

interface HeroSectionProps {
  setCurrentSection: (section: 'home' | 'analysis' | 'exploration') => void;
}

const HeroSection = ({ setCurrentSection }: HeroSectionProps) => {
  return (
    <div className="relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium mb-6">
              <Lightbulb className="w-4 h-4 mr-2" />
              AI-Powered Quranic Science Analysis
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Temukan Keajaiban
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
              Al-Quran & Sains
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Platform edukasi interaktif yang menggunakan AI untuk menganalisis keterkaitan antara 
            ayat-ayat Al-Quran dengan konsep-konsep ilmiah modern. Eksplorasi mendalam untuk 
            memperkuat iman melalui perspektif sains.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 py-6 text-lg"
              onClick={() => setCurrentSection('analysis')}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Mulai Analisis Ayat
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-8 py-6 text-lg"
              onClick={() => setCurrentSection('exploration')}
            >
              Jelajahi Kategori Sains
            </Button>
          </div>
        </div>
        
        <div className="mt-16">
          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-emerald-100 shadow-xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                "Dan Kami ciptakan dari air segala sesuatu yang hidup"
              </h3>
              <p className="text-emerald-600 font-medium mb-6">QS. Al-Anbiya: 30</p>
              <div className="bg-emerald-50 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  <span className="font-semibold text-emerald-700">Analisis AI:</span> Ayat ini mengandung indikasi ilmiah tentang pentingnya air dalam kehidupan, 
                  yang sejalan dengan penemuan biologi modern bahwa semua makhluk hidup memiliki kandungan air 
                  yang tinggi dan proses metabolisme bergantung pada air.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Biologi</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Kimia</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Ekologi</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -z-10 w-1/3 h-full bg-gradient-to-l from-emerald-100/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 -z-10 w-1/3 h-full bg-gradient-to-r from-green-100/50 to-transparent"></div>
    </div>
  );
};

export default HeroSection;
