
import React from 'react';
import { Product, Category } from '../types';
import { TRANSLATIONS, DEFAULT_HERO_IMAGE } from '../constants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateHeroImage: (newImage: string) => void;
  currentHeroImage: string;
  lang: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  allProducts,
  onAddProduct, 
  onDeleteProduct,
  onUpdateHeroImage, 
  currentHeroImage,
  lang 
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];

  const [activeTab, setActiveTab] = React.useState<'products' | 'settings'>('products');

  const [formData, setFormData] = React.useState({
    name: '',
    price: '',
    category: Category.CASUAL,
    description: '',
    sizes: 'S, M, L',
    colors: 'Черный',
    image: ''
  });

  const productFileRef = React.useRef<HTMLInputElement>(null);
  const heroFileRef = React.useRef<HTMLInputElement>(null);

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeroFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateHeroImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image || !formData.name || !formData.price) return;

    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      image: formData.image,
      sizes: formData.sizes.split(',').map(s => s.trim()),
      colors: formData.colors.split(',').map(c => c.trim()),
    };

    onAddProduct(newProduct);
    setFormData({
      name: '',
      price: '',
      category: Category.CASUAL,
      description: '',
      sizes: 'S, M, L',
      colors: 'Черный',
      image: ''
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
        {/* Header Tabs */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('products')}
              className={`text-sm uppercase tracking-widest font-bold transition flex flex-col items-center gap-1 ${activeTab === 'products' ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <i className="fa-solid fa-plus-circle mb-1 text-lg"></i>
              <span>{t.catalog}</span>
              {activeTab === 'products' && <div className="h-0.5 w-full bg-amber-600 rounded-full"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`text-sm uppercase tracking-widest font-bold transition flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <i className="fa-solid fa-sliders mb-1 text-lg"></i>
              <span>{t.siteSettings}</span>
              {activeTab === 'settings' && <div className="h-0.5 w-full bg-amber-600 rounded-full"></div>}
            </button>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white border border-stone-100 rounded-full flex items-center justify-center shadow-sm hover:rotate-90 transition-transform">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-8">
          {activeTab === 'products' ? (
            <div className="space-y-12">
              {/* Add Form */}
              <form onSubmit={handleSubmitProduct} className="space-y-6 bg-stone-50 p-6 rounded-2xl border border-stone-100">
                <div className="flex flex-col items-center gap-4 mb-4">
                  {formData.image ? (
                    <div className="relative w-32 h-40 rounded-xl overflow-hidden shadow-lg group">
                      <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                      <button 
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white"
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => productFileRef.current?.click()}
                      className="w-32 h-40 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 hover:bg-white transition-all group"
                    >
                      <i className="fa-solid fa-camera text-2xl text-stone-300 group-hover:text-amber-500 mb-2"></i>
                      <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Добавить фото</span>
                    </div>
                  )}
                  <input type="file" ref={productFileRef} onChange={handleProductFileChange} className="hidden" accept="image/*" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Название</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 bg-white border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Цена (₸)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} className="w-full px-4 py-3 bg-white border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Категория</label>
                  <select value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as Category }))} className="w-full px-4 py-3 bg-white border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500">
                    {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <button type="submit" className="w-full py-4 bg-amber-600 text-white font-bold uppercase text-[11px] tracking-widest rounded-xl hover:bg-amber-700 transition shadow-lg">
                  Сохранить товар
                </button>
              </form>

              {/* List of Existing Products */}
              <div>
                <h3 className="text-xs uppercase font-bold text-stone-900 tracking-widest mb-6 flex items-center gap-2">
                  <i className="fa-solid fa-list-ul text-amber-500"></i>
                  Ранее созданные товары ({allProducts.length})
                </h3>
                <div className="space-y-3">
                  {allProducts.map(p => (
                    <div key={p.id} className="flex items-center gap-4 p-3 bg-white border border-stone-100 rounded-2xl hover:shadow-md transition group">
                      <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                        <img src={p.image} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                        <p className="text-[10px] text-amber-600 font-bold">{p.price.toLocaleString('ru-RU')} ₸</p>
                      </div>
                      <div className="flex items-center gap-2">
                         {p.id.startsWith('custom-') && (
                           <span className="text-[8px] font-bold uppercase bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Вы добавили</span>
                         )}
                         <button 
                          onClick={() => onDeleteProduct(p.id)}
                          className="w-8 h-8 rounded-full bg-stone-50 text-stone-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                         >
                           <i className="fa-solid fa-trash-can text-[10px]"></i>
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-sm font-bold text-stone-900 mb-4">{t.changeHeroBg}</h3>
                <div className="flex flex-col gap-6">
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-100 group">
                    <img src={currentHeroImage} className="w-full h-full object-cover" alt="Hero Preview" />
                    <div 
                      onClick={() => heroFileRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <i className="fa-solid fa-upload text-white text-3xl mb-2"></i>
                      <span className="text-white text-[10px] font-bold uppercase tracking-widest">Загрузить свое фото фона</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => heroFileRef.current?.click()}
                      className="flex-1 py-4 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-stone-800 transition"
                    >
                      Выбрать файл
                    </button>
                    <button 
                      onClick={() => onUpdateHeroImage(DEFAULT_HERO_IMAGE)}
                      className="flex-1 py-4 bg-stone-50 text-stone-400 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:text-stone-900 transition"
                    >
                      {t.resetDefault}
                    </button>
                  </div>
                  <input type="file" ref={heroFileRef} onChange={handleHeroFileChange} className="hidden" accept="image/*" />
                </div>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-4">
                 <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-md">
                    <i className="fa-solid fa-info text-sm"></i>
                 </div>
                 <div className="text-left">
                    <p className="text-[10px] font-bold text-stone-900 uppercase tracking-widest mb-1">Как это работает?</p>
                    <p className="text-[10px] text-stone-400 leading-relaxed">Все изменения сохраняются только в вашем браузере. Вы можете добавить свои лучшие фотографии платьев и использовать их для демонстрации клиентам.</p>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
