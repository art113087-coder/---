
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
      <div className="absolute inset-0 bg-stone-900/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] animate-scale-up">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center hover:bg-stone-200 transition"
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Product Image */}
        <div className="md:w-1/2 bg-stone-100 flex items-center justify-center overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Details and Reviews */}
        <div className="md:w-1/2 flex flex-col h-full bg-white overflow-y-auto">
          <div className="p-8 border-b border-stone-50">
            <span className="text-amber-600 uppercase tracking-widest text-[10px] font-bold mb-2 block">{product.category}</span>
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-2 leading-tight">{product.name}</h2>
            <p className="text-2xl font-serif font-bold text-amber-700 mb-6">{product.price.toLocaleString('ru-RU')} ₸</p>
            <p className="text-stone-500 text-sm leading-relaxed mb-6 italic">{product.description}</p>
          </div>

          <div className="p-8 flex-grow">
            <h3 className="text-xs uppercase font-bold tracking-widest text-stone-900 mb-6 flex items-center gap-2">
              <i className="fa-solid fa-star text-amber-500"></i> {t.reviews}
            </h3>

            {/* Reviews List */}
            <div className="space-y-6 mb-12">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev) => (
                  <div key={rev.id} className="bg-stone-50 p-5 rounded-2xl border border-stone-100 animate-fade-in">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-stone-800 text-xs mb-1">{rev.userName}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-solid fa-star text-[10px] ${i < rev.rating ? 'text-amber-500' : 'text-stone-300'}`}></i>
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">{rev.date}</span>
                    </div>
                    <p className="text-stone-600 text-xs leading-relaxed">{rev.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-stone-400 text-xs italic text-center py-4">{t.noReviews}</p>
              )}
            </div>

            {/* Leave Review Form */}
            <div className="border-t border-stone-100 pt-8">
              <h4 className="text-[10px] uppercase font-bold text-stone-400 tracking-widest mb-6">{t.leaveReview}</h4>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    required
                    type="text" 
                    placeholder={t.fullName}
                    value={newReview.userName}
                    onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                    className="w-full px-4 py-3 bg-stone-50 rounded-xl text-xs outline-none border border-transparent focus:border-amber-200"
                  />
                  <div className="flex items-center gap-2 px-4 bg-stone-50 rounded-xl">
                    <span className="text-[10px] text-stone-400 uppercase font-bold">{t.yourRating}</span>
                    <select 
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      className="bg-transparent text-xs font-bold text-amber-600 outline-none"
                    >
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                    </select>
                  </div>
                </div>
                <textarea 
                  required
                  placeholder={t.yourComment}
                  value={newReview.text}
                  onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                  className="w-full h-24 px-4 py-3 bg-stone-50 rounded-xl text-xs outline-none border border-transparent focus:border-amber-200 resize-none"
                />
                <button 
                  type="submit"
                  className="w-full py-3.5 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-amber-600 transition shadow-lg active:scale-95"
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
