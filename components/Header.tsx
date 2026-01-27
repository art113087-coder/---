
import React from 'react';
import { LANGUAGES, TRANSLATIONS } from '../constants';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onOpenVisualSearch: () => void;
  onShare: () => void;
  onNavigate: (view: 'home' | 'catalog') => void;
  lang: string;
  setLang: (lang: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  cartCount, 
  wishlistCount,
  onOpenCart, 
  onOpenWishlist,
  onOpenAdmin, 
  onOpenVisualSearch,
  onShare,
  onNavigate, 
  lang, 
  setLang 
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/98 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo Section */}
        <div 
          className="flex flex-col cursor-pointer group" 
          onClick={() => onNavigate('home')}
        >
          <span className="text-2xl font-bold tracking-tighter text-stone-900 font-serif leading-none group-hover:text-amber-600 transition-colors">ZHUMAGUL</span>
          <span className="text-[9px] uppercase tracking-[0.4em] text-stone-400 font-bold mt-1">
            BOUTIQUE SHYMKENT
          </span>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-10 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-600">
          <button onClick={() => onNavigate('home')} className="hover:text-amber-600 transition py-2">{t.home}</button>
          <button onClick={() => onNavigate('catalog')} className="hover:text-amber-600 transition py-2">{t.catalog}</button>
          <button onClick={onOpenVisualSearch} className="flex items-center gap-2 text-amber-600 py-2 group">
            <i className="fa-solid fa-camera-retro group-hover:scale-110 transition-transform"></i>
            {t.visualSearch}
          </button>
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex bg-stone-50 border border-stone-100 rounded-full p-0.5">
            {LANGUAGES.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${lang === l.code ? 'bg-white shadow-sm text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}
                title={l.label}
              >
                {l.code.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-stone-100 mx-2 hidden md:block"></div>

          <button onClick={onOpenWishlist} className="relative p-2 text-stone-700 hover:text-red-500 transition group">
            <i className="fa-solid fa-heart text-lg group-hover:scale-110 transition-transform"></i>
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </button>

          <button onClick={onOpenCart} className="relative p-2 text-stone-700 hover:text-amber-600 transition group">
            <i className="fa-solid fa-bag-shopping text-lg group-hover:scale-110 transition-transform"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold border-2 border-white shadow-sm animate-pop">
                {cartCount}
              </span>
            )}
          </button>

          <button onClick={onOpenAdmin} className="lg:hidden p-2 text-stone-400">
            <i className="fa-solid fa-bars text-lg"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
