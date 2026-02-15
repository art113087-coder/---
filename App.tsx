
import React from 'react';
import { Product, CartItem, Order, OrderStatus, Review, Category } from './types';
import { MOCK_PRODUCTS, TRANSLATIONS, DEFAULT_HERO_IMAGE, WHATSAPP_NUMBER, INSTAGRAM_HANDLE, SHOP_ADDRESS, SHOP_EMAIL } from './constants';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';
import AIChat from './components/AIChat';
import AIStudio from './components/AIStudio';
import LifestyleModal from './components/LifestyleModal';
import ComparisonModal from './components/ComparisonModal';
import ProductModal from './components/ProductModal';

const App: React.FC = () => {
  const [lang, setLang] = React.useState('ru');
  const t = TRANSLATIONS[lang];
  
  const [view, setView] = React.useState<'home' | 'catalog' | 'wishlist'>('home');
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [compareList, setCompareList] = React.useState<Product[]>([]);
  
  const [isCartOpen, setIsCartOpen] = React.useState(false);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);
  const [isStudioOpen, setIsStudioOpen] = React.useState(false);
  const [isCompareOpen, setIsCompareOpen] = React.useState(false);
  
  const [selectedProduct, setSelectedProduct] = React.useState<Product | null>(null);
  const [lifestyleProduct, setLifestyleProduct] = React.useState<Product | null>(null);
  
  const [orders, setOrders] = React.useState<Order[]>(JSON.parse(localStorage.getItem('zhumagul_orders') || '[]'));
  const [trackingId, setTrackingId] = React.useState('');
  const [foundOrder, setFoundOrder] = React.useState<Order | null>(null);
  const [showToast, setShowToast] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('Все');

  const placeOrder = (order: Order) => {
    const newOrders = [order, ...orders];
    setOrders(newOrders);
    localStorage.setItem('zhumagul_orders', JSON.stringify(newOrders));
    setCartItems([]);
    setIsCartOpen(false);
    setShowToast(`Заказ ${order.id} оформлен!`);
    setTimeout(() => setShowToast(null), 5000);
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('zhumagul_orders', JSON.stringify(updated));
  };

  const trackOrder = () => {
    const found = orders.find(o => o.id.toUpperCase() === trackingId.trim().toUpperCase());
    setFoundOrder(found || null);
    if (!found) {
      setShowToast("Заказ не найден");
      setTimeout(() => setShowToast(null), 3000);
    }
  };

  const addToCart = (product: Product, size: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === size);
      if (existing) return prev.map(item => item.id === product.id && item.selectedSize === size ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    setShowToast(`${product.name} в корзине!`);
    setTimeout(() => setShowToast(null), 3000);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prev => {
      const isIncluded = prev.includes(product.id);
      return isIncluded ? prev.filter(id => id !== product.id) : [...prev, product.id];
    });
  };

  const toggleCompare = (product: Product) => {
    setCompareList(prev => {
      const isIncluded = prev.find(p => p.id === product.id);
      if (isIncluded) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 4) {
        setShowToast("Максимум 4 товара для сравнения");
        setTimeout(() => setShowToast(null), 3000);
        return prev;
      }
      return [...prev, product];
    });
  };

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const categoryMatch = selectedCategory === 'Все' || p.category === selectedCategory;
    const isWishlistOnly = view === 'wishlist' ? wishlist.includes(p.id) : true;
    return categoryMatch && isWishlistOnly;
  });

  const categoriesList = ['Все', ...Object.values(Category)];

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-amber-100">
      {showToast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 animate-slide-in-top">
          <div className="bg-stone-900 text-white p-5 rounded-2xl shadow-2xl flex items-center gap-4 border border-stone-800">
            <div className="bg-amber-500 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0">
              <i className="fa-solid fa-check"></i>
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
        onOpenVisualSearch={() => {}}
        onShare={() => {}}
        onNavigate={(v) => { setView(v); setSelectedCategory('Все'); window.scrollTo(0,0); }}
        lang={lang}
        setLang={setLang}
      />

      <main className="flex-grow">
        {view === 'home' ? (
          <>
            {/* 1. Hero Section */}
            <section className="relative h-[85vh] flex items-center overflow-hidden">
              <div className="absolute inset-0">
                <img src={DEFAULT_HERO_IMAGE} className="w-full h-full object-cover animate-ken-burns" alt="Hero" />
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[1px]"></div>
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
                    Элегантность в каждой детали. Шымкент, рынок Автонур. Доставка Яндекс Go за 1 час.
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

            {/* 2. Feature Blocks (USP) */}
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

            {/* 3. Global Collections Grid */}
            <section className="py-24 px-6 max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-4">{lang === 'ru' ? 'Мировые коллекции' : 'Әлемдік топтамалар'}</h2>
                <p className="text-stone-400 max-w-xl mx-auto text-sm">{lang === 'ru' ? 'Лучшая одежда из Индии, Китая и Кыргызстана специально для вас' : 'Үндістан, Қытай және Қырғызстанның үздік киімдері арнайы сіздер үшін'}</p>
                <div className="w-20 h-1 bg-amber-600 mx-auto mt-6"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { title: 'Индия', category: Category.INDIA, img: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=800', desc: 'Натуральный шелк и хлопок' },
                  { title: 'Китай', category: Category.CHINA, img: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=800', desc: 'Модные платья Гуанчжоу' },
                  { title: 'Кыргызстан', category: Category.KYRGYZSTAN, img: 'https://images.unsplash.com/photo-1572804013307-f97119af50c7?q=80&w=800', desc: 'Мягкий бишкекский трикотаж' },
                ].map((cat, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setView('catalog'); setSelectedCategory(cat.category); window.scrollTo(0,0); }}
                    className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-700 border border-stone-100"
                  >
                    <img src={cat.img} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={cat.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-transparent"></div>
                    <div className="absolute bottom-10 left-10 right-10">
                      <p className="text-amber-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-2">{cat.desc}</p>
                      <h3 className="text-white text-3xl font-serif font-bold mb-4">{cat.title}</h3>
                      <div className="w-0 group-hover:w-full h-[1px] bg-amber-600 transition-all duration-700 mb-4"></div>
                      <span className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Смотреть платья <i className="fa-solid fa-arrow-right ml-2 text-[8px]"></i></span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Best Sellers */}
            <section className="py-24 bg-stone-50">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="flex justify-between items-end mb-16">
                    <div>
                      <h2 className="text-4xl font-serif font-bold text-stone-900">{t.bestSellers}</h2>
                      <p className="text-stone-400 mt-2 text-sm italic">{lang === 'ru' ? 'Самые популярные модели сезона' : 'Маусымның ең танымал модельдері'}</p>
                    </div>
                    <button onClick={() => setView('catalog')} className="text-amber-600 font-bold uppercase text-[11px] tracking-widest border-b border-amber-600/30 pb-1 hover:border-amber-600 transition-all">{t.catalog}</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {MOCK_PRODUCTS.slice(0, 8).map(p => (
                      <ProductCard 
                        key={p.id} product={p} 
                        onAddToCart={addToCart} 
                        onViewLifestyle={setLifestyleProduct} 
                        onToggleCompare={toggleCompare}
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

            {/* 5. Logistics Tracking Section */}
            <section className="py-24 bg-white border-t border-stone-100">
               <div className="max-w-4xl mx-auto px-6">
                  <div className="bg-stone-900 p-10 md:p-16 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
                    <div className="relative z-10 text-white">
                      <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">{t.trackOrder}</h2>
                      <p className="text-stone-400 mb-12 text-sm">{lang === 'ru' ? 'Введите номер заказа для отслеживания доставки из Автонура' : 'Автонурдан жеткізуді бақылау үшін тапсырыс нөмірін енгізіңіз'}</p>
                      
                      <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto mb-12">
                        <input 
                          value={trackingId} 
                          onChange={(e) => setTrackingId(e.target.value)} 
                          placeholder={t.orderIdPlaceholder} 
                          className="flex-grow px-8 py-5 bg-white/10 rounded-full border-none outline-none ring-1 ring-white/20 focus:ring-amber-500 transition-all text-sm font-bold text-white placeholder:text-stone-500"
                        />
                        <button onClick={trackOrder} className="px-10 py-5 bg-amber-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-full hover:bg-amber-500 transition shadow-lg">{t.trackBtn}</button>
                      </div>

                      {foundOrder && (
                        <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] text-left animate-fade-in border border-white/10">
                          <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
                            <div>
                              <p className="text-[10px] uppercase font-bold text-amber-500 mb-1 tracking-widest">Заказ #{foundOrder.id}</p>
                              <p className="text-2xl font-serif font-bold">{t[`status_${foundOrder.status}`]}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-widest">Район</p>
                              <p className="text-sm font-bold text-amber-500">{foundOrder.district}</p>
                            </div>
                          </div>

                          <div className="relative flex justify-between items-center">
                            <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2"></div>
                            <div className={`absolute top-1/2 left-0 h-1 bg-amber-600 -translate-y-1/2 transition-all duration-1000 ${foundOrder.status === 'pending' ? 'w-0' : foundOrder.status === 'preparing' ? 'w-1/3' : foundOrder.status === 'shipped' ? 'w-2/3' : 'w-full'}`}></div>
                            
                            {['pending', 'preparing', 'shipped', 'delivered'].map((st, i) => {
                              const isActive = ['pending', 'preparing', 'shipped', 'delivered'].indexOf(foundOrder.status) >= i;
                              return (
                                <div key={st} className="relative z-10 flex flex-col items-center">
                                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-stone-900 transition-all duration-500 ${isActive ? 'bg-amber-600 text-white shadow-lg' : 'bg-stone-800 text-stone-500'}`}>
                                    <i className={`fa-solid ${st === 'pending' ? 'fa-receipt' : st === 'preparing' ? 'fa-box-open' : st === 'shipped' ? 'fa-taxi' : 'fa-check'} text-xs`}></i>
                                  </div>
                                  <span className={`text-[8px] uppercase font-bold mt-3 tracking-tighter ${isActive ? 'text-white' : 'text-stone-500'}`}>{t[`status_${st}`]}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            </section>

            {/* 6. Yandex Go Promo Block */}
            <section className="py-24 bg-white">
              <div className="max-w-7xl mx-auto px-6">
                <div className="bg-yellow-400 rounded-[3.5rem] p-12 md:p-24 flex flex-col lg:flex-row items-center gap-16 shadow-2xl overflow-hidden relative group">
                  <div className="relative z-10 lg:w-1/2">
                    <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center text-yellow-400 text-4xl mb-8 group-hover:rotate-12 transition-transform duration-500">
                      <i className="fa-solid fa-taxi"></i>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-serif font-bold text-black mb-8 leading-tight">{t.yandexPromoTitle}</h2>
                    <p className="text-xl text-black/80 font-medium mb-12 max-w-md leading-relaxed">{t.yandexPromoDesc}</p>
                    <button onClick={() => setView('catalog')} className="px-12 py-5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl">Выбрать платье</button>
                  </div>
                  <div className="lg:w-1/2 relative">
                    <img src="https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=1200" className="rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-700" alt="Delivery" />
                    <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl animate-bounce">
                      <p className="text-black font-bold text-xs">Яндекс Go <span className="text-amber-600">от 600 ₸</span></p>
                    </div>
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
                    {categoriesList.map(cat => (
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
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
               {filteredProducts.map(p => (
                 <ProductCard 
                   key={p.id} product={p} 
                   onAddToCart={addToCart}
                   onViewLifestyle={setLifestyleProduct} 
                   onToggleCompare={toggleCompare} 
                   onToggleWishlist={toggleWishlist} 
                   onShowDetails={() => setSelectedProduct(p)}
                   isCompared={!!compareList.find(x => x.id === p.id)} 
                   isWishlisted={wishlist.includes(p.id)} 
                   lang={lang}
                 />
               ))}
             </div>
          </section>
        )}
      </main>

      <footer className="bg-stone-900 text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-20 mb-20">
          <div>
            <h3 className="text-3xl font-serif font-bold text-amber-500 mb-8 tracking-tighter">ZHUMAGUL BOUTIQUE</h3>
            <p className="text-stone-400 text-sm leading-relaxed mb-8">Рынок Автонур, г. Шымкент. Мы делаем стиль доступным для каждой женщины.</p>
            <div className="flex gap-4">
               <a href={`https://instagram.com/${INSTAGRAM_HANDLE}`} target="_blank" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-amber-600 transition-all"><i className="fa-brands fa-instagram"></i></a>
               <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-green-600 transition-all"><i className="fa-brands fa-whatsapp"></i></a>
               <a href={`mailto:${SHOP_EMAIL}`} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-blue-600 transition-all"><i className="fa-solid fa-envelope"></i></a>
            </div>
          </div>
          <div>
             <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-8">РАЗДЕЛЫ</h4>
             <ul className="space-y-4 text-xs font-bold uppercase tracking-widest text-stone-500">
               <li><button onClick={() => setView('home')} className="hover:text-white transition-colors">{t.home}</button></li>
               <li><button onClick={() => setView('catalog')} className="hover:text-white transition-colors">{t.catalog}</button></li>
               <li><button onClick={() => setIsAdminOpen(true)} className="hover:text-white transition-colors">Управление</button></li>
             </ul>
          </div>
          <div>
             <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-amber-500 mb-8">ЛОКАЦИЯ</h4>
             <p className="text-stone-400 text-sm mb-4"><i className="fa-solid fa-location-dot mr-2 text-amber-600"></i> {SHOP_ADDRESS}</p>
             <p className="text-stone-400 text-sm mb-4"><i className="fa-solid fa-envelope mr-2 text-amber-600"></i> {SHOP_EMAIL}</p>
             <p className="text-stone-400 text-sm mb-4"><i className="fa-solid fa-clock mr-2 text-amber-600"></i> 09:00 - 18:00</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-white/5 text-center text-[10px] font-bold text-stone-600 tracking-widest uppercase">
          © 2024 Zhumagul Shymkent. Шымкентский бутик платьев.
        </div>
      </footer>

      {/* Floating Action Buttons */}
      <a 
        href={`https://wa.me/${WHATSAPP_NUMBER}`} 
        target="_blank" 
        className="fixed bottom-6 left-6 z-50 w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform animate-bounce"
      >
        <i className="fa-brands fa-whatsapp text-3xl"></i>
      </a>
      
      {compareList.length > 0 && (
        <button 
          onClick={() => setIsCompareOpen(true)}
          className="fixed bottom-24 left-6 z-50 w-16 h-16 bg-amber-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        >
          <i className="fa-solid fa-scale-balanced text-xl"></i>
          <span className="absolute -top-1 -right-1 bg-white text-amber-600 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-amber-600">{compareList.length}</span>
        </button>
      )}

      {/* Modals & Overlays */}
      <Cart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems} 
        onRemoveItem={(id, sz) => setCartItems(prev => prev.filter(i => !(i.id === id && i.selectedSize === sz)))}
        onUpdateQuantity={(id, sz, delta) => setCartItems(prev => prev.map(i => i.id === id && i.selectedSize === sz ? {...i, quantity: Math.max(1, i.quantity + delta)} : i))}
        onPlaceOrder={placeOrder} 
        lang={lang} 
      />
      
      <AdminPanel 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        allProducts={MOCK_PRODUCTS} 
        orders={orders} 
        onAddProduct={() => {}} 
        onDeleteProduct={() => {}} 
        onUpdateHeroImage={() => {}} 
        onUpdateOrderStatus={updateOrderStatus} 
        currentHeroImage={DEFAULT_HERO_IMAGE} 
        lang={lang} 
      />

      <ComparisonModal products={compareList} isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} lang={lang} />
      <LifestyleModal product={lifestyleProduct} onClose={() => setLifestyleProduct(null)} lang={lang} />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddReview={() => {}} lang={lang} />
      <AIStudio isOpen={isStudioOpen} onClose={() => setIsStudioOpen(false)} lang={lang} />
      <AIChat lang={lang} />
    </div>
  );
};

export default App;
