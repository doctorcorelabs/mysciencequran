
import { BookOpen, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:justify-center gap-8 items-start">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-700 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold">Neuro-Quran Insight</h3>
                <p className="text-xs text-emerald-400">Al-Quran & Sains Modern</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed text-justify">
              Platform edukasi interaktif yang memadukan<br />
              kearifan Al-Quran dengan penemuan sains modern<br />
              melalui teknologi AI.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Kontak</h4>
            <div className="space-y-3">
              <a href="mailto:daivanlabs@gmail.com" className="flex items-center text-sm hover:text-emerald-400 transition-colors">
                <Mail className="w-4 h-4 mr-2" />
                daivanlabs@gmail.com
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-center items-center">
            <p className="text-sm text-gray-400">
              © 2025 Neuro-Quran Insight. Semua hak dilindungi.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
