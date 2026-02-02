
import React from 'react';
import { Product } from '../types';
import { TRANSLATIONS } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string) => void;
  onViewLifestyle: (product: Product) => void;
  onToggleCompare: (product: Product) => void;
  onToggleWishlist: (product: Product) => void;
  onDelete?: () => void;
  onShowDetails: () => void;
  isCompared: boolean;
  isWishlisted: boolean;
  lang: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onViewLifestyle, 
  onToggleCompare,
  onToggleWishlist,
  onDelete,
  onShowDetails,
  isCompared,
  isWishlisted,
  lang 
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedSize, setSelectedSize] = React.useState(product.sizes[0]);
  const [isAdded, setIsAdded] = React.useState(false);

  const handleAdd = () => {
    onAddToCart(product, selectedSize);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const rating = product.reviews && product.reviews.length > 0 
    ? (product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length).toFixed(1)
    : null;

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-stone-100 flex flex-col h-full relative">
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer product-image-container" onClick={onShowDetails}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Wishlist Toggle */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          className={`absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
            isWishlisted ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-white/90 text-stone-400 hover:text-red-500 shadow-sm'
          }`}
        >
          <i className="fa-solid fa-heart text-[12px]"></i>
        </button>

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-white/20">
            <i className="fa-solid fa-star text-amber-500 text-[9px]"></i>
            <span className="text-[10px] font-bold text-stone-700">{rating}</span>
          </div>
        )}

        {/* Compare Toggle */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleCompare(product); }}
          className={`absolute top-16 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCompared ? 'bg-amber-600 text-white shadow-lg scale-110' : 'bg-white/90 text-stone-400 hover:text-amber-600 shadow-sm'
          }`}
          title={t.compare}
        >
          <i className="fa-solid fa-scale-balanced text-[12px]"></i>
        </button>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={(e) => { e.stopPropagation(); onViewLifestyle(product); }}
            className="px-6 py-3 bg-white text-stone-900 text-[10px] uppercase font-bold tracking-[0.2em] rounded-full shadow-2xl hover:bg-amber-600 hover:text-white transition-all transform translate-y-6 group-hover:translate-y-0 duration-500"
          >
            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> {t.aiLifestyle}
          </button>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 
            className="font-serif text-lg text-stone-800 leading-tight cursor-pointer hover:text-amber-600 transition"
            onClick={onShowDetails}
          >
            {product.name}
          </h3>
          <span className="text-[10px] uppercase font-bold tracking-widest text-stone-300">{product.category}</span>
        </div>
        <p className="text-amber-700 font-bold text-xl mb-6">{product.price.toLocaleString('ru-RU')} ₸</p>
        
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-10 h-10 text-[10px] flex items-center justify-center border rounded-full font-bold transition-all duration-300 ${
                  selectedSize === size 
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                  : 'bg-white border-stone-200 text-stone-400 hover:border-stone-500 hover:text-stone-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleAdd}
            disabled={isAdded}
            className={`w-full py-4 text-[11px] uppercase tracking-[0.3em] font-bold rounded-xl transition-all duration-500 flex items-center justify-center gap-2 ${
              isAdded 
              ? 'bg-green-600 text-white shadow-inner' 
              : 'bg-stone-900 text-white hover:bg-amber-600 shadow-lg active:scale-95'
            }`}
          >
            {isAdded ? (
              <>
                <i className="fa-solid fa-check"></i> {t.added}
              </>
            ) : (
              <>
                <i className="fa-solid fa-cart-plus mr-1"></i> {t.addToCart}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
