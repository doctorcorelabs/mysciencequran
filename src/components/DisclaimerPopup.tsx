import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck, Info, X } from "lucide-react";

const DisclaimerPopup = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Tampilkan popup langsung saat komponen dimount
    setIsOpen(true);
    
    // Tutup popup otomatis setelah 10 detik
    const autoCloseTimer = setTimeout(() => {
      setIsOpen(false);
    }, 10000);

    return () => clearTimeout(autoCloseTimer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <ShieldCheck className="w-5 h-5" />
            Disclaimer Penting
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert className="border-emerald-200 bg-emerald-50">
            <Info className="h-4 w-4 text-emerald-600" />
            <AlertTitle className="text-emerald-800">Sumber Data Al-Quran</AlertTitle>
            <AlertDescription className="text-emerald-700 text-justify">
              Informasi berkaitan tentang Al-Quran menggunakan sumber resmi dari 
              <strong> Kementerian Agama (Kemenag) Republik Indonesia</strong>.
            </AlertDescription>
          </Alert>

          <Alert className="border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800">Hasil Analisis AI</AlertTitle>
            <AlertDescription className="text-amber-700 text-justify">
              Untuk hasil analisis dari AI menggunakan informasi model LLM sehingga 
              <strong> perlu untuk cek kembali informasi yang dihasilkan</strong>.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-gray-600 space-y-2">
            <p className="text-justify">
              Platform ini bertujuan untuk edukasi dan eksplorasi ilmiah. 
              Selalu konsultasikan dengan ulama atau ahli agama untuk 
              pemahaman yang lebih mendalam.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleClose}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DisclaimerPopup;
