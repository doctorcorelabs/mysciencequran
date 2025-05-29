
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Microscope, 
  Atom, 
  Globe, 
  Heart, 
  Calculator, 
  Zap, 
  Mountain, 
  Stethoscope,
  ArrowRight 
} from "lucide-react";

const ThematicExploration = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    {
      id: 'biology',
      title: 'Biologi',
      icon: <Microscope className="w-8 h-8" />,
      color: 'green',
      description: 'Embriologi, genetika, dan kehidupan',
      verses: [
        { surah: 'Al-Mu\'minun', ayah: 14, topic: 'Perkembangan Embrio' },
        { surah: 'Al-Anbiya', ayah: 30, topic: 'Asal Usul Kehidupan dari Air' },
        { surah: 'An-Nur', ayah: 45, topic: 'Keanekaragaman Makhluk Hidup' }
      ]
    },
    {
      id: 'astronomy',
      title: 'Astronomi',
      icon: <Globe className="w-8 h-8" />,
      color: 'blue',
      description: 'Alam semesta, planet, dan bintang',
      verses: [
        { surah: 'Adz-Dzariyat', ayah: 47, topic: 'Ekspansi Alam Semesta' },
        { surah: 'Al-Anbiya', ayah: 33, topic: 'Orbit Planet dan Bintang' },
        { surah: 'Yasin', ayah: 40, topic: 'Sistem Tata Surya' }
      ]
    },
    {
      id: 'physics',
      title: 'Fisika',
      icon: <Atom className="w-8 h-8" />,
      color: 'purple',
      description: 'Energi, materi, dan hukum alam',
      verses: [
        { surah: 'An-Nur', ayah: 35, topic: 'Sifat Cahaya' },
        { surah: 'Al-Hadid', ayah: 25, topic: 'Sifat Besi dan Logam' },
        { surah: 'Ar-Rahman', ayah: 33, topic: 'Spektrum Elektromagnetik' }
      ]
    },
    {
      id: 'medicine',
      title: 'Kedokteran',
      icon: <Stethoscope className="w-8 h-8" />,
      color: 'red',
      description: 'Kesehatan dan penyembuhan',
      verses: [
        { surah: 'An-Nahl', ayah: 69, topic: 'Khasiat Madu' },
        { surah: 'Al-Baqarah', ayah: 168, topic: 'Makanan Halal dan Sehat' },
        { surah: 'Asy-Syu\'ara', ayah: 80, topic: 'Penyembuhan dari Allah' }
      ]
    },
    {
      id: 'geology',
      title: 'Geologi',
      icon: <Mountain className="w-8 h-8" />,
      color: 'amber',
      description: 'Bumi, gunung, dan formasi geologi',
      verses: [
        { surah: 'An-Naba', ayah: 7, topic: 'Gunung sebagai Pasak' },
        { surah: 'Luqman', ayah: 10, topic: 'Stabilitas Bumi' },
        { surah: 'Az-Zumar', ayah: 21, topic: 'Siklus Air dan Tanah' }
      ]
    },
    {
      id: 'mathematics',
      title: 'Matematika',
      icon: <Calculator className="w-8 h-8" />,
      color: 'indigo',
      description: 'Angka, pola, dan kalkulasi',
      verses: [
        { surah: 'Al-Kahf', ayah: 25, topic: 'Sistem Kalender' },
        { surah: 'Yunus', ayah: 5, topic: 'Perhitungan Waktu' },
        { surah: 'An-Nisa', ayah: 11, topic: 'Matematika Waris' }
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      green: 'border-green-200 hover:bg-green-50',
      blue: 'border-blue-200 hover:bg-blue-50',
      purple: 'border-purple-200 hover:bg-purple-50',
      red: 'border-red-200 hover:bg-red-50',
      amber: 'border-amber-200 hover:bg-amber-50',
      indigo: 'border-indigo-200 hover:bg-indigo-50'
    };
    return colorMap[color] || 'border-gray-200 hover:bg-gray-50';
  };

  const getIconColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      green: 'text-green-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      red: 'text-red-600',
      amber: 'text-amber-600',
      indigo: 'text-indigo-600'
    };
    return colorMap[color] || 'text-gray-600';
  };

  const getBadgeColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800',
      amber: 'bg-amber-100 text-amber-800',
      indigo: 'bg-indigo-100 text-indigo-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Eksplorasi Tematik Sains</h2>
        <p className="text-lg text-gray-600">
          Jelajahi ayat-ayat Al-Quran berdasarkan kategori ilmu pengetahuan
        </p>
      </div>

      {!selectedCategory ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${getColorClasses(category.color)}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <CardHeader className="text-center">
                <div className={`mx-auto mb-4 ${getIconColorClasses(category.color)}`}>
                  {category.icon}
                </div>
                <CardTitle className="text-xl">{category.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-center mb-4">{category.description}</p>
                <Badge className={`w-full justify-center ${getBadgeColorClasses(category.color)}`}>
                  {category.verses.length} ayat terkait
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedCategory(null)}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              ← Kembali ke Kategori
            </Button>
          </div>

          {(() => {
            const category = categories.find(c => c.id === selectedCategory);
            if (!category) return null;

            return (
              <div>
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4 ${getIconColorClasses(category.color)}`}>
                    {category.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{category.title}</h3>
                  <p className="text-gray-600">{category.description}</p>
                </div>

                <div className="grid gap-6">
                  {category.verses.map((verse, index) => (
                    <Card key={index} className="border-emerald-100 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center space-x-3 mb-3">
                              <Badge className={getBadgeColorClasses(category.color)}>
                                QS. {verse.surah}:{verse.ayah}
                              </Badge>
                              <h4 className="font-semibold text-gray-900">{verse.topic}</h4>
                            </div>
                            <p className="text-gray-600 mb-4">
                              Ayat ini mengandung indikasi ilmiah tentang {verse.topic.toLowerCase()} yang sejalan 
                              dengan penemuan modern dalam bidang {category.title.toLowerCase()}.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">
                                Relevansi Tinggi
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                Terbukti Ilmiah
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ThematicExploration;
