
import React from 'react';
import { getFashionAdviceWithMaps } from '../services/geminiService';
import { MOCK_PRODUCTS, SHOP_ADDRESS, TRANSLATIONS } from '../constants';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';

interface AIChatProps {
  lang: string;
}

// Helper functions for manual base64 encoding/decoding as per guidelines.
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const AIChat: React.FC<AIChatProps> = ({ lang }) => {
  const t = TRANSLATIONS[lang];
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLiveMode, setIsLiveMode] = React.useState(false);
  const [messages, setMessages] = React.useState<{ role: 'user' | 'ai', text: string, links?: any[] }[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSpeaking, setIsSpeaking] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const sessionRef = React.useRef<any>(null);
  const nextStartTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    setMessages([{ role: 'ai', text: t.aiGreeting }]);
  }, [lang]);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading, isLiveMode]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input.trim();
    if (!userMsg || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    let location: any = undefined;
    try {
      const pos: any = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 });
      });
      location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {}

    const productNames = MOCK_PRODUCTS.map(p => p.name);
    const response = await getFashionAdviceWithMaps(userMsg, productNames, location, lang);

    setMessages(prev => [...prev, { 
      role: 'ai', 
      text: response.text, 
      links: response.grounding 
    }]);
    setIsLoading(false);
  };

  const stopLiveMode = () => {
    if (sessionRef.current) { sessionRef.current.close(); sessionRef.current = null; }
    if (audioContextRef.current) { audioContextRef.current.close(); audioContextRef.current = null; }
    setIsLiveMode(false); setIsSpeaking(false);
    nextStartTimeRef.current = 0;
  };

  const startLiveMode = async () => {
    try {
      setIsLiveMode(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const base64 = encode(new Uint8Array(int16.buffer));
              sessionPromise.then(s => s.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } }));
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              setIsSpeaking(true);
              const audioBuffer = await decodeAudioData(
                decode(audioData),
                audioContextRef.current,
                24000,
                1
              );
              
              const source = audioContextRef.current.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioContextRef.current.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              source.onended = () => {
                if (audioContextRef.current && nextStartTimeRef.current <= audioContextRef.current.currentTime) {
                  setIsSpeaking(false);
                }
              };
            }

            if (msg.serverContent?.interrupted) {
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `You are a professional fashion assistant for "Zhumagul" in Shymkent. Respond ONLY in the requested language (code: ${lang}). Shop address: ${SHOP_ADDRESS}.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { stopLiveMode(); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button onClick={() => setIsOpen(!isOpen)} className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform duration-300 ${isOpen ? 'bg-stone-900 text-white' : 'bg-amber-600 text-white'}`}>
        {isOpen ? <i className="fa-solid fa-xmark text-xl"></i> : <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[340px] md:w-[420px] bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col animate-slide-up ring-1 ring-black/5">
          <div className="bg-stone-900 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-900/20">
                <i className={`fa-solid ${isLiveMode ? 'fa-microphone animate-pulse' : 'fa-sparkles'} text-sm`}></i>
              </div>
              <div>
                <h3 className="text-white text-sm font-bold leading-none mb-1">{t.aiAssistant}</h3>
                <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">{isLiveMode ? 'Live' : 'Text'}</p>
              </div>
            </div>
          </div>

          <div ref={scrollRef} className="flex-grow p-4 space-y-4 h-[420px] overflow-y-auto bg-stone-50/50">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-white text-stone-700 border border-stone-200 rounded-tl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="animate-pulse flex gap-2"><div className="w-2 h-2 bg-amber-600 rounded-full"></div></div>}
          </div>

          <div className="p-4 bg-white border-t border-stone-100 flex gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder="..." className="flex-grow bg-stone-100 rounded-full px-5 py-3 text-xs outline-none" />
            <button onClick={isLiveMode ? stopLiveMode : startLiveMode} className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-lg ${isLiveMode ? 'bg-red-500 text-white' : 'bg-stone-100 text-stone-600'}`}>
              <i className={`fa-solid ${isLiveMode ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
            </button>
            <button onClick={() => handleSend()} className="w-11 h-11 bg-stone-900 text-white rounded-full flex items-center justify-center shadow-lg"><i className="fa-solid fa-paper-plane text-xs"></i></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChat;
