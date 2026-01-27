
import React from 'react';
import { Product } from '../types';
import { TRANSLATIONS } from '../constants';

interface ComparisonModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

const ComparisonModal: React.FC<ComparisonModalProps> = ({ products, isOpen, onClose, lang }) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0">
          <h2 className="text-2xl font-serif font-bold text-stone-900">{t.compareTitle}</h2>
          <button onClick={onClose} className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-grow overflow-x-auto p-6">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="w-1/4 p-4 border-b border-stone-100 text-left text-[10px] uppercase tracking-widest text-stone-400"></th>
                {products.map(p => (
                  <th key={p.id} className="w-1/4 p-4 border-b border-stone-100 text-center">
                    <img src={p.image} className="w-32 h-40 mx-auto object-cover rounded-lg shadow-sm mb-4" alt={p.name} />
                    <h3 className="font-serif text-lg text-stone-800 leading-tight">{p.name}</h3>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="p-4 border-b border-stone-50 font-bold text-stone-400 uppercase text-[10px] tracking-widest">{t.price}</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 border-b border-stone-50 text-center font-bold text-amber-700 text-lg">
                    {p.price.toLocaleString('ru-RU')} ₸
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-stone-50 font-bold text-stone-400 uppercase text-[10px] tracking-widest">{t.categories}</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 border-b border-stone-50 text-center text-stone-600">
                    {p.category}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-stone-50 font-bold text-stone-400 uppercase text-[10px] tracking-widest">{t.sizes}</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 border-b border-stone-50 text-center text-stone-600">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {p.sizes.map(s => <span key={s} className="px-2 py-1 bg-stone-100 rounded text-[9px] font-bold">{s}</span>)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-stone-50 font-bold text-stone-400 uppercase text-[10px] tracking-widest">{t.colors}</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 border-b border-stone-50 text-center text-stone-600">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {p.colors.map(c => <span key={c} className="px-2 py-1 bg-stone-100 rounded text-[9px] font-bold">{c}</span>)}
                    </div>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 border-b border-stone-50 font-bold text-stone-400 uppercase text-[10px] tracking-widest">{t.description}</td>
                {products.map(p => (
                  <td key={p.id} className="p-4 border-b border-stone-50 text-center text-stone-500 text-xs italic leading-relaxed">
                    {p.description}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonModal;
