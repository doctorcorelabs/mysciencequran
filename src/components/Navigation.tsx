
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Lightbulb } from "lucide-react";

interface NavigationProps {
  currentSection: 'home' | 'analysis';
  setCurrentSection: (section: 'home' | 'analysis') => void;
}

const Navigation = ({ currentSection, setCurrentSection }: NavigationProps) => {
  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-green-700 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Neuro-Quran Insight</h1>
              <p className="text-xs text-emerald-600">Al-Quran & Sains Modern</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Button
              variant={currentSection === 'home' ? 'default' : 'ghost'}
              onClick={() => setCurrentSection('home')}
              className="text-gray-700 hover:text-emerald-600"
            >
              Beranda
            </Button>
            <Button
              variant={currentSection === 'analysis' ? 'default' : 'ghost'}
              onClick={() => setCurrentSection('analysis')}
              className="text-gray-700 hover:text-emerald-600"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Analisis AI
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
