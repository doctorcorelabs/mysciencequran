
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Microscope, Globe, Atom, TrendingUp } from "lucide-react";

const PopularFindings = () => {
  const popularFindings = [
    {
      surah: "Al-Anbiya",
      ayah: 30,
      topic: "Asal Usul Kehidupan dari Air",
      description: "Ayat ini menyebutkan bahwa segala sesuatu yang hidup diciptakan dari air, sejalan dengan teori biologi modern tentang pentingnya air untuk kehidupan.",
      scientificField: "Biologi",
      icon: <Microscope className="w-5 h-5" />,
      views: "2.1k",
      category: "biology"
    },
    {
      surah: "Adz-Dzariyat",
      ayah: 47,
      topic: "Ekspansi Alam Semesta",
      description: "Konsep perluasan langit yang disebutkan dalam ayat ini berkorelasi dengan teori Big Bang dan ekspansi alam semesta.",
      scientificField: "Astronomi",
      icon: <Globe className="w-5 h-5" />,
      views: "1.8k",
      category: "astronomy"
    },
    {
      surah: "Al-Hadid",
      ayah: 25,
      topic: "Sifat Khusus Besi",
      description: "Ayat ini menyebutkan bahwa besi 'diturunkan' ke bumi, yang sejalan dengan teori astrofisika tentang pembentukan unsur berat di bintang.",
      scientificField: "Fisika",
      icon: <Atom className="w-5 h-5" />,
      views: "1.5k",
      category: "physics"
    }
  ];

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      biology: "bg-green-100 text-green-800",
      astronomy: "bg-blue-100 text-blue-800",
      physics: "bg-purple-100 text-purple-800"
    };
    return colorMap[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 bg-gradient-to-r from-emerald-50 to-green-50">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="w-6 h-6 text-emerald-600 mr-2" />
          <h2 className="text-3xl font-bold text-gray-900">Temuan Populer</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Eksplorasi yang paling banyak diminati dari keterkaitan Al-Quran dengan sains modern
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {popularFindings.map((finding, index) => (
          <Card key={index} className="border-emerald-100 hover:shadow-xl transition-all hover:-translate-y-1">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className={getCategoryColor(finding.category)}>
                  <div className="flex items-center">
                    {finding.icon}
                    <span className="ml-1">{finding.scientificField}</span>
                  </div>
                </Badge>
                <div className="flex items-center text-sm text-gray-500">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {finding.views}
                </div>
              </div>
              <CardTitle className="text-lg leading-tight">{finding.topic}</CardTitle>
              <p className="text-sm text-emerald-600 font-medium">
                QS. {finding.surah}:{finding.ayah}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed text-justify">
                {finding.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
};

export default PopularFindings;
