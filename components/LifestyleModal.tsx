
import React from 'react';
import { Product } from '../types';
import { generateLifestyleImage } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface LifestyleModalProps {
  product: Product | null;
  onClose: () => void;
  lang: string;
}

const LifestyleModal: React.FC<LifestyleModalProps> = ({ product, onClose, lang }) => {
  const t = TRANSLATIONS[lang];
  
  const MOODS = [
    { id: 'formal', label: t.moodFormal, prompt: 'at a luxury gala event in a grand hall, cinematic lighting, sophisticated atmosphere' },
    { id: 'casual', label: t.moodCasual, prompt: 'at a casual outdoor terrace cafe, soft daylight, natural lifestyle photography' },
    { id: 'city', label: t.moodCity, prompt: 'on a modern city street in Shymkent, urban background, high-fashion editorial style' }
  ];

  const [generatedImage, setGeneratedImage] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedMood, setSelectedMood] = React.useState(MOODS[0]);

  const handleGenerate = async (mood = selectedMood) => {
    if (!product) return;
    setIsLoading(true);
    setGeneratedImage(null);
    
    const img = await generateLifestyleImage(product.name, product.description, mood.prompt);
    setGeneratedImage(img);
    setIsLoading(false);
  };

  React.useEffect(() => {
    if (product) {
      handleGenerate(MOODS[0]);
    }
  }, [product]);

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-auto animate-scale-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="md:w-1/2 bg-stone-100 flex items-center justify-center relative min-h-[400px]">
          {isLoading ? (
            <div className="text-center p-8 space-y-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-amber-600/20 rounded-full mx-auto"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <p className="font-serif italic text-stone-600 text-lg">{t.aiGenerating}</p>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-2">Analysing style & setting...</p>
              </div>
            </div>
          ) : generatedImage ? (
            <img src={generatedImage} alt="AI Lifestyle Look" className="w-full h-full object-cover animate-fade-in" />
          ) : (
            <div className="text-center p-8 text-stone-400">
              <i className="fa-solid fa-image text-5xl mb-4 opacity-20"></i>
              <p>Image could not be created. Please try again.</p>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 bg-stone-900/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
            <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
            <span className="text-[9px] text-white font-bold uppercase tracking-widest">Powered by Gemini AI</span>
          </div>
        </div>

        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <span className="text-amber-600 uppercase tracking-widest text-[10px] font-bold mb-2">Exclusive AI Stylist</span>
          <h2 className="text-3xl font-serif font-bold text-stone-900 mb-4 leading-tight">{product.name}</h2>
          <p className="text-stone-500 text-sm mb-10 leading-relaxed font-light">
            Наш ИИ-стилист создал визуализацию того, как это платье будет смотреться в выбранной вами обстановке.
          </p>

          <div className="space-y-8">
            <div>
              <label className="text-[10px] uppercase font-bold text-stone-400 tracking-[0.2em] mb-4 block">{t.categories.toUpperCase()}</label>
              <div className="flex flex-col gap-3">
                {MOODS.map(mood => (
                  <button
                    key={mood.id}
                    onClick={() => {
                      setSelectedMood(mood);
                      handleGenerate(mood);
                    }}
                    disabled={isLoading}
                    className={`flex items-center justify-between px-6 py-4 rounded-xl text-xs font-bold tracking-widest border transition-all duration-300 ${
                      selectedMood.id === mood.id 
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xl -translate-y-0.5' 
                      : 'bg-stone-50 text-stone-500 border-stone-100 hover:border-stone-300 hover:bg-white'
                    }`}
                  >
                    <span>{mood.label.toUpperCase()}</span>
                    {selectedMood.id === mood.id && <i className="fa-solid fa-sparkles text-amber-500"></i>}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-[9px] text-stone-400 uppercase font-bold tracking-widest">Price</p>
                <p className="text-2xl font-serif font-bold text-amber-700">{product.price.toLocaleString('ru-RU')} ₸</p>
              </div>
              <button 
                onClick={onClose}
                className="px-8 py-4 bg-stone-100 text-stone-800 text-[10px] uppercase font-bold tracking-widest rounded-xl hover:bg-stone-200 transition shadow-sm active:scale-95"
              >
                {t.backToCart}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifestyleModal;
