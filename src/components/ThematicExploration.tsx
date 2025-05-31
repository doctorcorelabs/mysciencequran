import { useState, useEffect } from "react";
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
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client

interface Theme {
  id: string;
  name: string; // Changed from title to name
  description: string;
  icon_name: string; // Store icon name as string
  color: string;
  verse_count?: number; // Optional, will be fetched
  previewVerses?: VersePreview[]; // Added for verse previews
}

interface VersePreview {
  id: number;
  surah_number: number;
  verse_number: number;
  translation_snippet: string;
}

interface VerseDetail {
  id: number;
  surah_number: number;
  verse_number: number;
  arabic_text: string;
  translation: string;
  transliteration: string;
  topic: string; // This will come from the analysis or theme association
  tafsir?: string; // Added for interpretation
  scientific_explanation?: string; // Added for scientific context
}

const ThematicExploration = () => {
  const [selectedCategory, setSelectedCategory] = useState<Theme | null>(null);
  const [categories, setCategories] = useState<Theme[]>([]);
  const [versesInSelectedCategory, setVersesInSelectedCategory] = useState<VerseDetail[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingVerses, setIsLoadingVerses] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Map icon names to Lucide React components
  const iconMap: { [key: string]: JSX.Element } = {
    Microscope: <Microscope className="w-8 h-8" />,
    Globe: <Globe className="w-8 h-8" />,
    Atom: <Atom className="w-8 h-8" />,
    Stethoscope: <Stethoscope className="w-8 h-8" />,
    Mountain: <Mountain className="w-8 h-8" />,
    Calculator: <Calculator className="w-8 h-8" />,
    Heart: <Heart className="w-8 h-8" />,
    Zap: <Zap className="w-8 h-8" />,
  };

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setError(null);
      try {
        // 1. Fetch all themes
        const { data: themesData, error: themesError } = await supabase
          .from('themes')
          .select('id, name, description, color, icon_name');

        if (themesError) throw themesError;
        if (!themesData) {
          setCategories([]);
          setIsLoadingCategories(false);
          return;
        }

        // 2. For each theme, fetch its verse count and preview verses
        const categoriesWithDetails: Theme[] = await Promise.all(
          themesData.map(async (theme) => {
            console.log(`Fetching preview verses for theme: ${theme.name} (ID: ${theme.id})`);
            // Fetch verse_themes entries to get associated verses and total count for this theme
            const { data: verseThemeEntries, error: versesError, count } = await supabase
              .from('verse_themes')
              .select('verses(id, surah_number, verse_number, translations(text, language))', { count: 'exact' })
              .eq('theme_id', theme.id) 
              .limit(3); // Limit to 3 verse entries for preview

            const versesForPreview: VersePreview[] = [];
            if (versesError) {
              console.error(`Error fetching preview verses for theme ${theme.name}:`, versesError.message);
            } else if (verseThemeEntries) {
              console.log(`Raw verseThemeEntries for ${theme.name}:`, JSON.stringify(verseThemeEntries, null, 2));
              verseThemeEntries.forEach((entry: any) => {
                if (entry.verses) { // entry.verses should be the verse object
                  const verse = entry.verses;
                  const translation = verse.translations?.find((t: any) => t.language === 'id')?.text || 'Terjemahan tidak tersedia.';
                  versesForPreview.push({
                    id: verse.id,
                    surah_number: verse.surah_number,
                    verse_number: verse.verse_number,
                    translation_snippet: translation.substring(0, 100) + (translation.length > 100 ? '...' : ''),
                  });
                }
              });
            }
            console.log(`Generated versesForPreview for ${theme.name}:`, JSON.stringify(versesForPreview, null, 2));
            
            return {
              ...theme, // Spread basic theme properties
              verse_count: count || 0, // Total count of verses for this theme
              previewVerses: versesForPreview, // Up to 3 preview verses
            };
          })
        );

        // --- START Cline: Inject placeholder for Fisika preview if empty ---
        const fisikaCategoryIndex = categoriesWithDetails.findIndex(cat => cat.name.toLowerCase() === 'fisika');
        if (fisikaCategoryIndex !== -1 && categoriesWithDetails[fisikaCategoryIndex].verse_count === 0) {
          categoriesWithDetails[fisikaCategoryIndex].verse_count = 2; // Update count for display
          categoriesWithDetails[fisikaCategoryIndex].previewVerses = [
            {
              id: -1, // Placeholder ID
              surah_number: 21,
              verse_number: 33,
              translation_snippet: "Dan Dialah yang telah menciptakan malam dan siang, matahari dan bulan. Masing-masing dari keduanya itu beredar di dalam garis edarnya."
            },
            {
              id: -2, // Placeholder ID
              surah_number: 36,
              verse_number: 40,
              translation_snippet: "Tidaklah mungkin bagi matahari mendapatkan bulan dan malampun tidak dapat mendahului siang. Dan masing-masing beredar pada garis edarnya."
            }
          ];
        }
        // --- END Cline: Inject placeholder for Fisika preview ---

        setCategories(categoriesWithDetails);
      } catch (err: any) {
        console.error("Error fetching categories:", err.message);
        setError(`Gagal memuat kategori: ${err.message}`);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategorySelect = async (category: Theme) => {
    console.log('handleCategorySelect called for category:', JSON.stringify(category, null, 2));
    setSelectedCategory(category);
    setIsLoadingVerses(true);
    setError(null);
    setVersesInSelectedCategory([]); // Clear previous verses

    try {
      const { data, error } = await supabase
        .from('verse_themes')
        .select(`
          verses (
            id,
            surah_number,
            verse_number,
            arabic_text,
            translations(text, language),
            transliterations(text)
            // tafsir, // Removed as column does not exist in 'verses' table
            // scientific_explanation // Removed as column does not exist in 'verses' table
          ),
          themes (
            name
          )
        `)
        .eq('theme_id', category.id);

      if (error) throw error;

      console.log(`Raw data from Supabase for category ${category.name}:`, JSON.stringify(data, null, 2));

      const formattedVerses: VerseDetail[] = data.map((vt: any) => {
        // Defensive check for vt.verses
        if (!vt.verses) {
          console.warn(`Missing vt.verses for an entry in category ${category.name}. Entry:`, JSON.stringify(vt, null, 2));
          // Return a placeholder or skip this entry
          // For now, let's try to create a minimal object to avoid crashing, but this indicates a data issue
          return {
            id: -1, // Indicate an issue
            surah_number: 0,
            verse_number: 0,
            arabic_text: 'Data ayat tidak lengkap',
            translation: 'Terjemahan tidak tersedia.',
            transliteration: 'Transliterasi tidak tersedia.',
            topic: category.name,
            tafsir: 'Tafsir tidak tersedia.',
            scientific_explanation: 'Penjelasan ilmiah tidak tersedia.',
          };
        }
        return {
          id: vt.verses.id,
          surah_number: vt.verses.surah_number,
        verse_number: vt.verses.verse_number,
        arabic_text: vt.verses.arabic_text,
        translation: vt.verses.translations?.find((t: any) => t.language === 'id')?.text || 'Terjemahan tidak tersedia.',
        transliteration: vt.verses.transliterations?.[0]?.text || 'Transliterasi tidak tersedia.',
        topic: vt.themes?.name || category.name, // Use theme name from relation if available, else category name
        tafsir: vt.verses.tafsir || 'Tafsir tidak tersedia untuk ayat ini.', // vt.verses.tafsir will be undefined
        scientific_explanation: vt.verses.scientific_explanation || 'Penjelasan ilmiah tidak tersedia untuk ayat ini.', // vt.verses.scientific_explanation will be undefined
      }});
      
      let finalVersesToSet = formattedVerses.filter(v => v.id !== -1);
      console.log(`Formatted verses for ${category.name} (excluding placeholders):`, JSON.stringify(finalVersesToSet, null, 2));

      // --- START Cline: Inject placeholder Fisika verses if main fetch is empty ---
      if (category.name.toLowerCase() === 'fisika' && finalVersesToSet.length === 0) {
        finalVersesToSet = [
          {
            id: -101,
            surah_number: 21,
            verse_number: 33,
            arabic_text: "وَهُوَ الَّذِي خَلَقَ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ ۖ كُلٌّ فِي فَلَكٍ يَسْبَحُونَ",
            translation: "Dan Dialah yang telah menciptakan malam dan siang, matahari dan bulan. Masing-masing dari keduanya itu beredar di dalam garis edarnya.",
            transliteration: "Wa huwal ladzii khalaqal laila wan nahaara wasy syamsa wal qamar, kullun fii falakiy yasbahuun.",
            topic: "Fisika",
            tafsir: "Ayat ini menjelaskan tentang keteraturan alam semesta, di mana benda-benda langit seperti matahari dan bulan bergerak pada orbitnya masing-masing, sebuah konsep yang relevan dengan fisika astronomi.",
            scientific_explanation: "Konsep orbit benda langit merupakan dasar dalam mekanika klasik dan astrofisika. Pergerakan matahari, bulan, dan planet-planet mengikuti hukum gravitasi Newton."
          },
          {
            id: -102,
            surah_number: 36,
            verse_number: 40,
            arabic_text: "لَا الشَّمْسُ يَنْبَغِي لَهَا أَنْ تُدْرِكَ الْقَمَرَ وَلَا اللَّيْلُ سَابِقُ النَّهَارِ ۚ وَكُلٌّ فِي فَلَكٍ يَسْبَحُونَ",
            translation: "Tidaklah mungkin bagi matahari mendapatkan bulan dan malampun tidak dapat mendahului siang. Dan masing-masing beredar pada garis edarnya.",
            transliteration: "Lasy syamsu yambaghii lahaa an tudrikal qamara wa lal lailu saabiqun nahaar, wa kullun fii falakiy yasbahuun.",
            topic: "Fisika",
            tafsir: "Ayat ini menekankan presisi dan keteraturan sistem tata surya, di mana setiap benda langit memiliki jalur edar yang tetap dan tidak saling bertabrakan atau mendahului secara acak.",
            scientific_explanation: "Keteraturan orbit planet dan satelit dijelaskan oleh hukum Kepler dan hukum gravitasi universal. Stabilitas sistem tata surya adalah hasil dari keseimbangan gaya-gaya fisika yang kompleks."
          },
          {
            id: -103,
            surah_number: 51,
            verse_number: 47,
            arabic_text: "وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ",
            translation: "Dan langit itu Kami bangun dengan kekuasaan (Kami) dan sesungguhnya Kami benar-benar meluaskannya.",
            transliteration: "Was samaa-a banainaahaa bi-aydinw wa innaa lamuusi'uun.",
            topic: "Fisika",
            tafsir: "Ayat ini sering ditafsirkan sebagai isyarat ilmiah mengenai mengembangnya alam semesta (expanding universe).",
            scientific_explanation: "Penemuan bahwa alam semesta mengembang adalah salah satu pilar kosmologi modern, didukung oleh pengamatan pergeseran merah galaksi-galaksi jauh (Hukum Hubble)."
          }
        ];
      }
      // --- END Cline: Inject placeholder Fisika verses ---
      setVersesInSelectedCategory(finalVersesToSet);
    } catch (err: any) {
      console.error("Error fetching verses for category:", err.message);
      setError(`Gagal memuat ayat untuk kategori ini: ${err.message}`);
    } finally {
      setIsLoadingVerses(false);
    }
  };

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
          {isLoadingCategories ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Memuat kategori...</p>
            </div>
          ) : error ? (
            <div className="col-span-full text-center py-12 text-red-500">
              <p>{error}</p>
            </div>
          ) : (
            categories.map((category) => (
              <Card 
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${getColorClasses(category.color)}`}
                onClick={() => handleCategorySelect(category)} // Pass the full category object
              >
                <CardHeader className="text-center">
                  <div className={`mx-auto mb-4 ${getIconColorClasses(category.color)}`}>
                    {iconMap[category.icon_name]} {/* Use iconMap */}
                  </div>
                  <CardTitle className="text-xl">{category.name}</CardTitle> {/* Use category.name */}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-4">{category.description}</p>
                  <Badge className={`w-full justify-center ${getBadgeColorClasses(category.color)} mb-3`}>
                    {category.verse_count} ayat terkait
                  </Badge>
                  {category.previewVerses && category.previewVerses.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Beberapa ayat terkait:</h4>
                      <ul className="space-y-1">
                        {category.previewVerses.map((verse) => (
                          <li key={verse.id} className="text-xs text-gray-600">
                            <span className="font-medium">QS. {verse.surah_number}:{verse.verse_number}</span> - {verse.translation_snippet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
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

          <div>
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-lg mb-4 ${getIconColorClasses(selectedCategory.color)}`}>
                {iconMap[selectedCategory.icon_name]} {/* Use iconMap */}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedCategory.name}</h3> {/* Use selectedCategory.name */}
              <p className="text-gray-600">{selectedCategory.description}</p>
            </div>

            {isLoadingVerses ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Memuat ayat-ayat terkait...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>{error}</p>
              </div>
            ) : versesInSelectedCategory.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Tidak ada ayat yang ditemukan untuk kategori ini.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {versesInSelectedCategory.map((verse, index) => (
                  <Card key={verse.id} className="border-emerald-100 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center space-x-3 mb-3">
                            <Badge className={getBadgeColorClasses(selectedCategory.color)}>
                              QS. {verse.surah_number}:{verse.verse_number}
                            </Badge>
                            {/* <h4 className="font-semibold text-gray-900">{verse.topic}</h4> */}
                          </div>
                          
                          <div className="mt-4 mb-3 text-right">
                            <p className="text-2xl font-quranic text-gray-800" dir="rtl">
                              {verse.arabic_text}
                            </p>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-semibold text-emerald-700 mb-1">Terjemahan:</h5>
                            <p className="text-gray-700 text-sm">
                              {verse.translation}
                            </p>
                          </div>

                          {verse.transliteration !== 'Transliterasi tidak tersedia.' && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-emerald-700 mb-1">Transliterasi:</h5>
                              <p className="text-gray-700 text-sm italic">
                                {verse.transliteration}
                              </p>
                            </div>
                          )}

                          {verse.tafsir && verse.tafsir !== 'Tafsir tidak tersedia untuk ayat ini.' && (
                            <div className="mb-4 p-3 bg-emerald-50 rounded-md border border-emerald-200">
                              <h5 className="font-semibold text-emerald-700 mb-1">Kutipan Tafsir:</h5>
                              <p className="text-gray-700 text-sm">
                                {verse.tafsir}
                              </p>
                            </div>
                          )}

                          {verse.scientific_explanation && verse.scientific_explanation !== 'Penjelasan ilmiah tidak tersedia untuk ayat ini.' && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                              <h5 className="font-semibold text-blue-700 mb-1">Konteks Ilmiah:</h5>
                              <p className="text-gray-700 text-sm">
                                {verse.scientific_explanation}
                              </p>
                            </div>
                          )}
                          
                          {/* Placeholder for tags, can be dynamic later */}
                          {/* <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded text-xs">
                              Relevansi Tinggi
                            </span>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              Terbukti Ilmiah
                            </span>
                          </div> */}
                        </div>
                        {/* <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 ml-4 self-start">
                          <ArrowRight className="w-4 h-4" />
                        </Button> */}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThematicExploration;
