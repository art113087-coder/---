
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
    <div className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col h-full relative">
      <div className="relative aspect-[3/4] overflow-hidden cursor-pointer" onClick={onShowDetails}>
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Wishlist Toggle */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleWishlist(product); }}
          className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isWishlisted ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-white/90 text-stone-400 hover:text-red-500 shadow-sm'
          }`}
        >
          <i className="fa-solid fa-heart text-[10px]"></i>
        </button>

        {/* Rating Badge */}
        {rating && (
          <div className="absolute top-4 right-14 z-10 bg-white/90 backdrop-blur-md px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
            <i className="fa-solid fa-star text-amber-500 text-[8px]"></i>
            <span className="text-[9px] font-bold text-stone-700">{rating}</span>
          </div>
        )}

        {/* Compare Toggle */}
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleCompare(product); }}
          className={`absolute top-14 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isCompared ? 'bg-amber-600 text-white shadow-lg scale-110' : 'bg-white/90 text-stone-400 hover:text-amber-600 shadow-sm'
          }`}
          title={t.compare}
        >
          <i className="fa-solid fa-scale-balanced text-[10px]"></i>
        </button>

        {/* Delete Button (Only for custom products) */}
        {onDelete && (
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="absolute top-4 left-4 z-10 w-8 h-8 bg-stone-900/80 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-lg opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
            title="Удалить товар"
          >
            <i className="fa-solid fa-trash-can text-[10px]"></i>
          </button>
        )}

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button 
            onClick={(e) => { e.stopPropagation(); onViewLifestyle(product); }}
            className="px-5 py-2.5 bg-white/95 backdrop-blur-md text-stone-900 text-[10px] uppercase font-bold tracking-widest rounded-full shadow-xl hover:bg-amber-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0"
          >
            <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> {t.aiLifestyle}
          </button>
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        <h3 
          className="font-serif text-[17px] text-stone-800 mb-1.5 leading-tight cursor-pointer hover:text-amber-600 transition"
          onClick={onShowDetails}
        >
          {product.name}
        </h3>
        <p className="text-amber-700 font-bold text-base mb-4">{product.price.toLocaleString('ru-RU')} ₸</p>
        
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2.5 mb-6">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`w-9 h-9 text-[10px] flex items-center justify-center border rounded-full font-bold transition-all ${
                  selectedSize === size 
                  ? 'bg-stone-900 text-white border-stone-900 shadow-md' 
                  : 'bg-white border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          
          <button 
            onClick={handleAdd}
            disabled={isAdded}
            className={`w-full py-3.5 text-[11px] uppercase tracking-[0.2em] font-bold rounded-md transition-all duration-300 flex items-center justify-center gap-2 ${
              isAdded 
              ? 'bg-green-600 text-white scale-[0.98]' 
              : 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg active:translate-y-0.5'
            }`}
          >
            {isAdded ? (
              <>
                <i className="fa-solid fa-check"></i> {t.added.toUpperCase()}
              </>
            ) : (
              <>
                <span className="text-lg leading-none mb-0.5">+</span> {t.addToCart.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
