
import React from 'react';
import { Product, Review } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddReview: (productId: string, review: Review) => void;
  lang: string;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddReview, lang }) => {
  if (!product) return null;
  const t = TRANSLATIONS[lang];

  const [newReview, setNewReview] = React.useState({ userName: '', rating: 5, text: '' });
  const [isZoomed, setIsZoomed] = React.useState(false);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.text) return;

    const review: Review = {
      id: Date.now().toString(),
      userName: newReview.userName,
      rating: newReview.rating,
      text: newReview.text,
      date: new Date().toLocaleDateString('ru-RU')
    };

    onAddReview(product.id, review);
    setNewReview({ userName: '', rating: 5, text: '' });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-6xl bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] animate-scale-up">
        {/* Lightbox Trigger for Image */}
        {isZoomed && (
          <div 
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center cursor-zoom-out animate-fade-in"
            onClick={() => setIsZoomed(false)}
          >
            <img 
              src={product.image} 
              className="max-w-[95%] max-h-[95%] object-contain"
              alt={product.name} 
            />
            <button className="absolute top-10 right-10 text-white text-3xl hover:scale-125 transition">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/20 hover:bg-white text-stone-900 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-xl border border-white/30"
        >
          <i className="fa-solid fa-xmark text-lg"></i>
        </button>

        {/* Product Image Section */}
        <div 
          className="md:w-[55%] bg-stone-100 flex items-center justify-center overflow-hidden relative group lightbox-zoom"
          onClick={() => setIsZoomed(true)}
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl">
              <i className="fa-solid fa-magnifying-glass-plus text-amber-600"></i>
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-800">Нажмите, чтобы увеличить</span>
            </div>
          </div>
        </div>

        {/* Details and Reviews Section */}
        <div className="md:w-[45%] flex flex-col h-full bg-white overflow-y-auto">
          <div className="p-10 border-b border-stone-100">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-amber-50 text-amber-700 uppercase tracking-widest text-[9px] font-bold rounded-full border border-amber-100">{product.category}</span>
              <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">In Stock</span>
            </div>
            <h2 className="text-4xl font-serif font-bold text-stone-900 mb-4 leading-tight">{product.name}</h2>
            <div className="flex items-end gap-4 mb-8">
              <p className="text-3xl font-serif font-bold text-amber-700">{product.price.toLocaleString('ru-RU')} ₸</p>
              <p className="text-stone-400 text-sm line-through mb-1">{(product.price * 1.2).toLocaleString('ru-RU')} ₸</p>
            </div>
            <p className="text-stone-500 text-sm leading-relaxed mb-8 font-light">{product.description}</p>
            
            <div className="flex gap-3">
              <button className="flex-grow py-5 bg-stone-900 text-white text-[11px] font-bold uppercase tracking-[0.3em] rounded-2xl hover:bg-amber-600 transition shadow-xl active:scale-95">
                Добавить в корзину
              </button>
              <button className="w-16 h-16 border border-stone-200 rounded-2xl flex items-center justify-center text-stone-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all duration-300">
                <i className="fa-solid fa-heart text-xl"></i>
              </button>
            </div>
          </div>

          <div className="p-10 flex-grow bg-stone-50/50">
            <h3 className="text-xs uppercase font-bold tracking-widest text-stone-900 mb-8 flex items-center gap-3">
              <i className="fa-solid fa-comment-dots text-amber-600"></i> {t.reviews}
            </h3>

            {/* Reviews List */}
            <div className="space-y-6 mb-12">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 font-bold uppercase text-[10px]">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-xs mb-1">{rev.userName}</p>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <i key={i} className={`fa-solid fa-star text-[9px] ${i < rev.rating ? 'text-amber-500' : 'text-stone-200'}`}></i>
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest">{rev.date}</span>
                    </div>
                    <p className="text-stone-600 text-xs leading-relaxed font-light">{rev.text}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-6">
                  <i className="fa-solid fa-message text-4xl text-stone-100 mb-4"></i>
                  <p className="text-stone-400 text-xs italic">{t.noReviews}</p>
                </div>
              )}
            </div>

            {/* Leave Review Form */}
            <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm">
              <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-8 border-b border-stone-50 pb-4">{t.leaveReview}</h4>
              <form onSubmit={handleSubmitReview} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-stone-400 uppercase ml-1">Имя</label>
                    <input 
                      required
                      type="text" 
                      placeholder={t.fullName}
                      value={newReview.userName}
                      onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                      className="w-full px-5 py-4 bg-stone-50 rounded-2xl text-xs outline-none border border-transparent focus:border-amber-200 transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-stone-400 uppercase ml-1">Оценка</label>
                    <div className="relative">
                      <select 
                        value={newReview.rating}
                        onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                        className="w-full px-5 py-4 bg-stone-50 rounded-2xl text-xs font-bold text-amber-600 outline-none border border-transparent focus:border-amber-200 appearance-none transition"
                      >
                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} звезд</option>)}
                      </select>
                      <i className="fa-solid fa-star absolute right-5 top-1/2 -translate-y-1/2 text-amber-500 text-[10px] pointer-events-none"></i>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-stone-400 uppercase ml-1">Комментарий</label>
                  <textarea 
                    required
                    placeholder={t.yourComment}
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    className="w-full h-32 px-5 py-4 bg-stone-50 rounded-2xl text-xs outline-none border border-transparent focus:border-amber-200 resize-none transition"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl hover:bg-amber-600 transition-all shadow-xl active:scale-95"
                >
                  {t.sendReview}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
