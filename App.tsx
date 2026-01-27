
import React from 'react';
import { Product, CartItem, Category, Review } from './types';
import { MOCK_PRODUCTS, INSTAGRAM_HANDLE, TELEGRAM_USERNAME, GMAIL_ACCOUNT, WHATSAPP_NUMBER, TRANSLATIONS, SHOP_ADDRESS, DEFAULT_HERO_IMAGE } from './constants';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AIChat from './components/AIChat';
import LifestyleModal from './components/LifestyleModal';
import AIStudio from './components/AIStudio';
import ComparisonModal from './components/ComparisonModal';
import AdminPanel from './components/AdminPanel';
import ProductModal from './components/ProductModal';
import { analyzeImageForSearch } from './services/geminiService';

const App: React.FC = () => {
  const [lang, setLang] = React.useState('ru');
  const t = TRANSLATIONS[lang];
  
  const [view, setView] = React.useState<'home' | 'catalog' | 'wishlist'>('home');
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  
  const [heroImage, setHeroImage] = React.useState<string>(localStorage.getItem('zhumagul_hero_bg') || DEFAULT_HERO_IMAGE);
  const [allProducts, setAllProducts] = React.useState<Product[]>([]);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);
  const [isVisualSearchOpen, setIsVisualSearchOpen] = React.useState(false);

  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Все');
  
  const [lifestyleProduct, setLifestyleProduct] = React.useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [isStudioOpen, setIsStudioOpen] = React.useState(false);
  const [showToast, setShowToast] = React.useState<string | null>(null);

  const [compareList, setCompareList] = React.useState<Product[]>([]);
  const [isCompareOpen, setIsCompareOpen] = React.useState(false);

  React.useEffect(() => {
    const savedProducts = localStorage.getItem('zhumagul_custom_products');
    const customProducts = savedProducts ? (JSON.parse(savedProducts) as Product[]) : [];
    setAllProducts([...MOCK_PRODUCTS, ...customProducts]);

    const savedWishlist = localStorage.getItem('zhumagul_wishlist');
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist) as string[]);
  }, []);

  const saveProducts = (products: Product[]) => {
    setAllProducts(products);
    const customOnly = products.filter(p => p.id.startsWith('custom-'));
    localStorage.setItem('zhumagul_custom_products', JSON.stringify(customOnly));
  };

  const updateHeroImage = (newImage: string) => {
    setHeroImage(newImage);
    localStorage.setItem('zhumagul_hero_bg', newImage);
    setShowToast(t.uploadSuccess);
    setTimeout(() => setShowToast(null), 3000);
  };

  const addProduct = (newProduct: Product) => {
    const updated = [...allProducts, newProduct];
    saveProducts(updated);
    setShowToast(`Товар "${newProduct.name}" добавлен!`);
    setTimeout(() => setShowToast(null), 3000);
  };

  const deleteProduct = (id: string) => {
    const updated = allProducts.filter(p => p.id !== id);
    saveProducts(updated);
    setShowToast("Товар удален");
    setTimeout(() => setShowToast(null), 3000);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isIncluded = prev.includes(product.id);
      const updated = isIncluded ? prev.filter(id => id !== product.id) : [...prev, product.id];
      localStorage.setItem('zhumagul_wishlist', JSON.stringify(updated));
      setShowToast(isIncluded ? "Удалено из избранного" : "Добавлено в избранное");
      setTimeout(() => setShowToast(null), 3000);
      return updated;
    });
  };

  const addToCart = (product: Product, size: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.selectedSize === size 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    setShowToast(`${product.name} добавлен!`);
    setTimeout(() => setShowToast(null), 3000);
  };

  const removeFromCart = (id: string, size: string) => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.selectedSize === size)));
  };

  const updateQuantity = (id: string, size: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
    const isWishlistOnly = view === 'wishlist' ? wishlist.includes(p.id) : true;
    return matchesSearch && categoryMatch && isWishlistOnly;
  });

  const openInMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(SHOP_ADDRESS)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-xs px-4 animate-slide-in-top">
          <div className="bg-stone-900 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 border border-stone-800/50">
            <div className="bg-amber-500 text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0">
              <i className="fa-solid fa-check text-xs"></i>
            </div>
            <p className="text-xs font-bold leading-tight">{showToast}</p>
          </div>
        </div>
      )}

      <Header 
        cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)} 
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setView('wishlist')}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenVisualSearch={() => setIsVisualSearchOpen(true)}
        onShare={() => {
            navigator.clipboard.writeText(window.location.href);
            setShowToast("Ссылка скопирована!");
            setTimeout(() => setShowToast(null), 3000);
        }}
        onNavigate={(v) => { setView(v); setSelectedCategory('Все'); setSearchQuery(''); window.scrollTo(0,0); }}
        lang={lang}
        setLang={setLang}
      />

      <main className="flex-grow">
        {view === 'home' ? (
          <>
            {/* Professional Hero Section */}
            <section className="relative h-[85vh] flex items-center overflow-hidden">
              <div className="absolute inset-0">
                <img src={heroImage} className="w-full h-full object-cover animate-ken-burns" alt="Boutique" />
                <div className="absolute inset-0 bg-stone-900/40"></div>
              </div>
              <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
                <div className="max-w-3xl text-white">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-600 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-8 shadow-lg shadow-amber-900/20">
                    <i className="fa-solid fa-crown text-[8px]"></i> {lang === 'ru' ? 'Новая коллекция 2024' : 'Жаңа топтама 2024'}
                  </div>
                  <h1 className="text-6xl md:text-9xl font-serif font-bold mb-8 leading-[1.05] drop-shadow-2xl">
                    Твое идеальное <br/><span className="italic text-amber-100 font-light">платье</span> здесь.
                  </h1>
                  <p className="text-xl md:text-2xl text-stone-100 mb-12 max-w-xl font-light drop-shadow-md leading-relaxed">
                    Элегантность в каждой детали. Приходите на примерку в наш бутик на рынке Автонур.
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <button onClick={() => setView('catalog')} className="px-12 py-6 bg-white text-stone-900 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-amber-600 hover:text-white transition-all rounded-full shadow-2xl active:scale-95">
                      Перейти в каталог
                    </button>
                    <button onClick={() => setIsStudioOpen(true)} className="px-12 py-6 bg-white/10 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 transition-all rounded-full active:scale-95">
                      <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> {t.aiStudio}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Feature Blocks (USP) */}
            <section className="py-16 bg-white border-b border-stone-100">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                  { icon: 'fa-truck-fast', title: lang === 'ru' ? 'Доставка' : 'Жеткізу', desc: lang === 'ru' ? 'Яндекс Go по городу' : 'Яндекс Go қала бойынша' },
                  { icon: 'fa-gem', title: lang === 'ru' ? 'Качество' : 'Сапа', desc: lang === 'ru' ? 'Турецкие и корейские ткани' : 'Түрік және корей маталары' },
                  { icon: 'fa-location-dot', title: lang === 'ru' ? 'Локация' : 'Мекен-жай', desc: lang === 'ru' ? 'Шымкент, Автонур' : 'Шымкент, Автонур' },
                  { icon: 'fa-whatsapp', title: lang === 'ru' ? 'Заказ' : 'Тапсырыс', desc: lang === 'ru' ? 'WhatsApp менеджер 24/7' : 'WhatsApp менеджер 24/7' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-6 rounded-2xl hover:bg-stone-50 transition-colors group">
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 text-xl group-hover:bg-amber-600 group-hover:text-white transition-all duration-500 shadow-sm">
                      <i className={`fa-solid ${item.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-stone-900 mb-1">{item.title}</h4>
                      <p className="text-[11px] text-stone-400 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Visual Category Grid (Professional Catalog Style) */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">{lang === 'ru' ? 'Выбирайте категорию' : 'Санатты таңдаңыз'}</h2>
                <div className="w-20 h-1 bg-amber-600 mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: 'Вечерние', img: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=800' },
                  { title: 'Повседневные', img: 'https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?q=80&w=800' },
                  { title: 'Офисные', img: 'https://images.unsplash.com/photo-1604176354204-926873ff34b0?q=80&w=800' },
                ].map((cat, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setView('catalog'); setSelectedCategory(cat.title); window.scrollTo(0,0); }}
                    className="group relative h-[500px] rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700"
                  >
                    <img src={cat.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={cat.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-10 left-10">
                      <h3 className="text-white text-3xl font-serif font-bold mb-3">{cat.title}</h3>
                      <span className="text-amber-400 text-[11px] font-bold uppercase tracking-[0.3em] border-b border-amber-400/50 pb-1 group-hover:border-amber-400 transition-all">Смотреть коллекцию</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Best Sellers Section */}
            <section className="py-24 bg-stone-50">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="flex justify-between items-end mb-16">
                    <div>
                      <h2 className="text-4xl font-serif font-bold text-stone-900">{t.bestSellers}</h2>
                      <p className="text-stone-400 mt-2 text-sm italic">{lang === 'ru' ? 'Самые популярные модели сезона' : 'Маусымның ең танымал модельдері'}</p>
                    </div>
                    <button onClick={() => setView('catalog')} className="text-amber-600 font-bold uppercase text-[11px] tracking-widest border-b border-amber-600/30 pb-1 hover:border-amber-600 transition-all">{t.catalog}</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
                    {allProducts.slice(0, 3).map(p => (
                      <ProductCard 
                        key={p.id} product={p} 
                        onAddToCart={addToCart} 
                        onViewLifestyle={setLifestyleProduct} 
                        onToggleCompare={(prod) => setCompareList(prev => prev.find(x => x.id === prod.id) ? prev.filter(x => x.id !== prod.id) : [...prev, prod])}
                        onToggleWishlist={toggleWishlist}
                        onShowDetails={() => setSelectedProduct(p)}
                        isCompared={!!compareList.find(x => x.id === p.id)}
                        isWishlisted={wishlist.includes(p.id)}
                        lang={lang} 
                      />
                    ))}
                  </div>
               </div>
            </section>

            {/* Yandex & Social Section */}
            <section className="py-24 bg-white">
               <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="bg-yellow-400 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                     <div className="relative z-10">
                        <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-yellow-400 text-5xl mb-8 group-hover:rotate-12 transition-transform">
                          <i className="fa-solid fa-taxi"></i>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-serif font-bold text-black mb-6 leading-tight">{t.yandexPromoTitle}</h2>
                        <p className="text-black/80 font-medium text-lg leading-relaxed mb-10 max-w-md">
                          {t.yandexPromoDesc}
                        </p>
                        <button onClick={() => setView('catalog')} className="bg-black text-white px-12 py-5 rounded-full text-xs font-bold uppercase tracking-[0.3em] shadow-xl hover:bg-stone-800 transition-all">Заказать доставку</button>
                     </div>
                     <div className="absolute -bottom-10 -right-10 text-black/5 text-[18rem] font-black pointer-events-none select-none">YANDEX</div>
                  </div>
                  <div className="space-y-10">
                     <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 leading-tight">{t.stayConnected}</h2>
                     <p className="text-stone-500 text-lg leading-relaxed">{t.followSocials}</p>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-8 rounded-3xl text-white group shadow-lg hover:-translate-y-2 transition-all">
                           <i className="fa-brands fa-instagram text-4xl mb-4 group-hover:scale-110 transition-transform"></i>
                           <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-80 mb-1">Instagram</p>
                           <p className="text-xl font-serif font-bold">@zhumagul_boutique</p>
                        </a>
                        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="bg-green-500 p-8 rounded-3xl text-white group shadow-lg hover:-translate-y-2 transition-all">
                           <i className="fa-brands fa-whatsapp text-4xl mb-4 group-hover:scale-110 transition-transform"></i>
                           <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-80 mb-1">WhatsApp</p>
                           <p className="text-xl font-serif font-bold">Заказать сейчас</p>
                        </a>
                     </div>
                  </div>
               </div>
            </section>

            {/* Visit Us Section */}
            <section className="py-24 bg-stone-50">
              <div className="max-w-7xl mx-auto px-6">
                <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl flex flex-col lg:flex-row">
                  <div className="lg:w-1/2 p-12 md:p-20">
                    <span className="text-amber-600 text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">{t.visitUs.toUpperCase()}</span>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-stone-900 mb-8 leading-tight">{t.mapsHint}</h2>
                    <div className="space-y-6 mb-12">
                      <div className="flex gap-4 items-start">
                        <i className="fa-solid fa-location-dot text-amber-600 mt-1"></i>
                        <p className="text-stone-600 font-medium">{SHOP_ADDRESS}</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <i className="fa-solid fa-clock text-amber-600 mt-1"></i>
                        <p className="text-stone-600 font-medium">{t.workHours}</p>
                      </div>
                    </div>
                    <button onClick={openInMaps} className="bg-stone-900 text-white px-12 py-5 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-amber-600 transition shadow-xl flex items-center gap-3">
                      <i className="fa-solid fa-map-location-dot"></i> {t.getDirections}
                    </button>
                  </div>
                  <div className="lg:w-1/2 relative min-h-[400px]">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200" className="absolute inset-0 w-full h-full object-cover" alt="Store" />
                    <div className="absolute inset-0 bg-stone-900/10"></div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <section className="py-24 px-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 border-b border-stone-100 pb-12">
               <div>
                  <h1 className="text-5xl md:text-7xl font-serif font-bold text-stone-900 mb-6">{view === 'wishlist' ? t.wishlist : t.catalog}</h1>
                  <div className="flex gap-3 flex-wrap">
                    {['Все', 'Вечерние', 'Повседневные', 'Летние', 'Офисные'].map(cat => (
                      <button 
                        key={cat} 
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-8 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${selectedCategory === cat ? 'bg-stone-900 text-white shadow-lg' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
               </div>
               <div className="relative w-full max-w-md group">
                 <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-full pl-6 pr-14 py-4.5 bg-stone-50 rounded-full border border-stone-100 text-sm focus:ring-2 focus:ring-amber-500 focus:bg-white outline-none transition-all shadow-inner"
                 />
                 <i className="fa-solid fa-magnifying-glass absolute right-6 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-amber-600 transition-colors"></i>
               </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-12">
                {filteredProducts.map(p => (
                  <ProductCard 
                    key={p.id} product={p} 
                    onAddToCart={addToCart} 
                    onViewLifestyle={setLifestyleProduct} 
                    onToggleCompare={(prod) => setCompareList(prev => prev.find(x => x.id === prod.id) ? prev.filter(x => x.id !== prod.id) : [...prev, prod])}
                    onToggleWishlist={toggleWishlist}
                    onShowDetails={() => setSelectedProduct(p)}
                    isCompared={!!compareList.find(x => x.id === p.id)}
                    isWishlisted={wishlist.includes(p.id)}
                    lang={lang} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-40 space-y-8">
                <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mx-auto text-stone-200">
                  <i className="fa-solid fa-magnifying-glass text-4xl"></i>
                </div>
                <p className="text-stone-400 font-serif italic text-2xl">{lang === 'ru' ? 'По вашему запросу ничего не найдено...' : 'Тапсырысыңыз бойынша ештеңе табылмады...'}</p>
                <button onClick={() => { setSearchQuery(''); setSelectedCategory('Все'); }} className="text-amber-600 font-bold uppercase text-[11px] tracking-widest border-b border-amber-600/30 pb-1">Сбросить поиск</button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modern Footer (Kovrolux style) */}
      <footer className="bg-stone-900 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-20 mb-24">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-4xl font-serif font-bold mb-10 tracking-tighter text-amber-500">ZHUMAGUL BOUTIQUE</h3>
            <p className="text-stone-400 max-w-sm text-sm leading-relaxed mb-10">
              {lang === 'ru' 
                ? 'Ваш персональный гид в мире стиля в Шымкенте. Мы создаем и подбираем платья, которые подчеркивают вашу уникальность и элегантность.' 
                : 'Шымкенттегі стиль әлеміндегі сіздің жеке нұсқаулығыңыз. Біз сіздің бірегейлігіңіз бен талғампаздығыңызды айқындайтын көйлектерді жасаймыз.'}
            </p>
            <div className="flex gap-6">
              {[
                { icon: 'fa-instagram', link: `https://instagram.com/${INSTAGRAM_HANDLE}` },
                { icon: 'fa-whatsapp', link: `https://wa.me/${WHATSAPP_NUMBER}` },
                { icon: 'fa-telegram', link: `https://t.me/${TELEGRAM_USERNAME}` },
              ].map((s, i) => (
                <a key={i} href={s.link} target="_blank" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-amber-600 transition-all duration-500 group">
                  <i className={`fa-brands ${s.icon} group-hover:scale-110 transition-transform`}></i>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.4em] font-bold text-amber-500 mb-10">{t.categories.toUpperCase()}</h4>
            <ul className="space-y-5 text-stone-400 text-xs font-bold uppercase tracking-widest">
              <li><button onClick={() => { setView('home'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">{t.home}</button></li>
              <li><button onClick={() => { setView('catalog'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">{t.catalog}</button></li>
              <li><button onClick={() => { setView('wishlist'); window.scrollTo(0,0); }} className="hover:text-white transition-colors">{t.wishlist}</button></li>
              <li><button onClick={() => setIsAdminOpen(true)} className="hover:text-white transition-colors">Панель управления</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] uppercase tracking-[0.4em] font-bold text-amber-500 mb-10">КОНТАКТЫ</h4>
            <div className="space-y-8 text-sm">
              <div className="flex gap-4">
                <i className="fa-solid fa-location-dot text-amber-600"></i>
                <p className="text-stone-400 leading-relaxed">{SHOP_ADDRESS}</p>
              </div>
              <div className="flex gap-4">
                <i className="fa-solid fa-phone text-amber-600"></i>
                <p className="text-stone-400">{WHATSAPP_NUMBER}</p>
              </div>
              <div className="flex gap-4">
                <i className="fa-solid fa-envelope text-amber-600"></i>
                <p className="text-stone-400">{GMAIL_ACCOUNT}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 text-center">
           <p className="text-[11px] text-stone-600 font-bold uppercase tracking-[0.4em]">© 2024 Zhumagul Boutique. Сделано в Шымкенте.</p>
        </div>
      </footer>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cartItems} onRemoveItem={removeFromCart} onUpdateQuantity={updateQuantity} lang={lang} />
      <LifestyleModal product={lifestyleProduct} onClose={() => setLifestyleProduct(null)} lang={lang} />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddReview={() => {}} lang={lang} />
      <AIStudio isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} lang={lang} />
      <ComparisonModal products={compareList} isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} lang={lang} />
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        allProducts={allProducts}
        onAddProduct={addProduct} 
        onDeleteProduct={deleteProduct}
        onUpdateHeroImage={updateHeroImage}
        currentHeroImage={heroImage}
        lang={lang} 
      />
      <AIChat lang={lang} />
    </div>
  );
};

export default App;
