
import React from 'react';
import { editImage, generateVeoVideo } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface AIStudioProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

const AIStudio: React.FC<AIStudioProps> = ({ isOpen, onClose, lang }) => {
  const t = TRANSLATIONS[lang];
  const [image, setImage] = React.useState<string | null>(null);
  const [prompt, setPrompt] = React.useState('');
  const [result, setResult] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [mode, setMode] = React.useState<'edit' | 'video'>('edit');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!prompt) return;

    // Veo video generation models require user-selected API keys.
    if (mode === 'video') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await window.aistudio.openSelectKey();
        // Proceeding after triggering the key selection dialog as per guidelines.
      }
    }

    setIsProcessing(true);
    setResult(null);

    try {
      if (mode === 'edit' && image) {
        const edited = await editImage(image.split(',')[1], prompt);
        setResult(edited);
      } else if (mode === 'video') {
        const videoUrl = await generateVeoVideo(prompt, image || undefined);
        setResult(videoUrl);
      }
    } catch (e: any) {
      console.error(e);
      // Reset key selection if the requested entity (project/key) wasn't found.
      if (e.message?.includes("Requested entity was not found")) {
        await window.aistudio.openSelectKey();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-scale-up h-[85vh]">
        <button onClick={onClose} className="absolute top-6 right-6 z-10 w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition">
          <i className="fa-solid fa-xmark"></i>
        </button>

        <div className="md:w-1/2 bg-stone-50 border-r border-stone-100 flex flex-col">
          <div className="p-8 flex-grow flex flex-col items-center justify-center">
            {image ? (
              <div className="relative w-full h-full max-h-[400px] rounded-2xl overflow-hidden shadow-inner group">
                <img src={image} className="w-full h-full object-cover" alt="Upload" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white font-bold"
                >
                  Сбросить фото
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[3/4] border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all group"
              >
                <i className="fa-solid fa-cloud-arrow-up text-4xl text-stone-300 group-hover:text-amber-500 mb-4"></i>
                <p className="text-stone-400 text-sm font-medium">Загрузите ваше фото</p>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
            )}
            <p className="mt-4 text-[10px] text-stone-400 uppercase tracking-widest font-bold">Основа для магии Zhumagul</p>
          </div>
        </div>

        <div className="md:w-1/2 p-10 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex gap-4 mb-8">
              <button 
                onClick={() => setMode('edit')}
                className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest rounded-full border transition ${mode === 'edit' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-200'}`}
              >
                Редактор (Image)
              </button>
              <button 
                onClick={() => setMode('video')}
                className={`flex-1 py-3 text-[10px] uppercase font-bold tracking-widest rounded-full border transition ${mode === 'video' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-400 border-stone-200'}`}
              >
                Анимация (Veo)
              </button>
            </div>

            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2">{t.aiStudioTitle}</h2>
            {mode === 'video' && (
              <p className="text-[10px] text-stone-400 mb-6">
                Requires a paid API key. See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-amber-600">billing documentation</a>.
              </p>
            )}
            <p className="text-stone-500 text-sm mb-8 leading-relaxed">
              {mode === 'edit' 
                ? 'Опишите, что изменить: "добавь вечерний макияж", "смени фон на берег океана" или "сделай в стиле ретро".' 
                : 'Оживите фото: "девушка идет по подиуму", "ткань платья развевается на ветру" или "эффект сияния".'}
            </p>

            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Введите вашу идею здесь..."
              className="w-full h-32 p-4 bg-stone-50 border border-stone-100 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none mb-6"
            />

            <button 
              onClick={handleAction}
              disabled={isProcessing || !prompt}
              className="w-full py-5 bg-amber-600 text-white font-bold uppercase tracking-[0.3em] text-xs rounded-2xl hover:bg-amber-700 transition shadow-xl disabled:opacity-30 flex items-center justify-center gap-3"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {t.aiGenerating}
                </>
              ) : (
                <>
                  <i className={`fa-solid ${mode === 'edit' ? 'fa-wand-magic-sparkles' : 'fa-film'}`}></i>
                  Генерировать
                </>
              )}
            </button>
          </div>

          {result && (
            <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl animate-fade-in">
              <p className="text-[10px] uppercase font-bold text-amber-700 mb-3 flex items-center gap-2">
                <i className="fa-solid fa-sparkles"></i> Готово!
              </p>
              {mode === 'edit' ? (
                <img src={result} className="w-full rounded-lg shadow-lg" alt="Result" />
              ) : (
                <video src={result} controls className="w-full rounded-lg shadow-lg" />
              )}
              <a 
                href={result} 
                download={`zhumagul-ai-${Date.now()}`}
                className="mt-4 block text-center text-xs font-bold text-stone-900 underline"
              >
                Скачать результат
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIStudio;
