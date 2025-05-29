
import { BookOpen, Mail, Github, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">MyScienceQuran</h3>
                <p className="text-xs text-emerald-400">Al-Quran & Sains Modern</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Platform edukasi interaktif yang memadukan kearifan Al-Quran dengan penemuan sains modern melalui teknologi AI.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Beranda</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Analisis AI</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Eksplorasi Tematik</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Database Al-Quran</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Sumber Daya</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Tentang Kami</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Metodologi</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Blog & Artikel</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <div className="space-y-3">
              <a href="mailto:info@mysciencequran.com" className="flex items-center text-sm hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                info@mysciencequran.com
              </a>
              <div className="flex space-x-2 pt-2">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-emerald-400 p-2">
                  <Twitter className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-emerald-400 p-2">
                  <Github className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-400">
              © 2024 MyScienceQuran. Semua hak dilindungi.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                Kebijakan Privasi
              </a>
              <a href="#" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                Syarat & Ketentuan
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
