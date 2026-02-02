
import React from 'react';
import { Product, Category, Order, OrderStatus } from '../types';
import { TRANSLATIONS, DEFAULT_HERO_IMAGE } from '../constants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  orders: Order[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateHeroImage: (newImage: string) => void;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => void;
  currentHeroImage: string;
  lang: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  isOpen, 
  onClose, 
  allProducts,
  orders,
  onAddProduct, 
  onDeleteProduct,
  onUpdateHeroImage, 
  onUpdateOrderStatus,
  currentHeroImage,
  lang 
}) => {
  if (!isOpen) return null;
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = React.useState<'products' | 'orders' | 'settings'>('products');

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

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, image: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image || !formData.name || !formData.price) return;
    onAddProduct({
      id: `custom-${Date.now()}`,
      name: formData.name,
      price: Number(formData.price),
      category: formData.category,
      description: formData.description,
      image: formData.image,
      sizes: formData.sizes.split(',').map(s => s.trim()),
      colors: formData.colors.split(',').map(c => c.trim()),
    });
    setFormData({ name: '', price: '', category: Category.CASUAL, description: '', sizes: 'S, M, L', colors: 'Черный', image: '' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/90 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-up max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between shrink-0 bg-stone-50/50">
          <div className="flex gap-8">
            {['products', 'orders', 'settings'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`text-[10px] uppercase tracking-widest font-bold transition flex flex-col items-center gap-1 ${activeTab === tab ? 'text-amber-600' : 'text-stone-400 hover:text-stone-600'}`}
              >
                <i className={`fa-solid ${tab === 'products' ? 'fa-plus-circle' : tab === 'orders' ? 'fa-truck-ramp-box' : 'fa-sliders'} text-lg`}></i>
                <span>{tab === 'products' ? t.catalog : tab === 'orders' ? 'Логистика' : t.siteSettings}</span>
              </button>
            ))}
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white border border-stone-100 rounded-full flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
        </div>

        <div className="flex-grow overflow-y-auto p-8">
          {activeTab === 'products' && (
            <div className="space-y-8">
              <form onSubmit={handleSubmitProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50 p-6 rounded-2xl">
                 <div className="flex flex-col items-center gap-4">
                    {formData.image ? <img src={formData.image} className="w-32 h-40 object-cover rounded-xl shadow-md" /> : <div onClick={() => productFileRef.current?.click()} className="w-32 h-40 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white"><i className="fa-solid fa-camera text-2xl text-stone-300"></i></div>}
                    <input type="file" ref={productFileRef} onChange={handleProductFileChange} className="hidden" />
                 </div>
                 <div className="space-y-4">
                    <input required placeholder="Название" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl text-sm border-none outline-none ring-1 ring-stone-100 focus:ring-amber-500" />
                    <input required type="number" placeholder="Цена" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} className="w-full px-4 py-3 bg-white rounded-xl text-sm border-none outline-none ring-1 ring-stone-100 focus:ring-amber-500" />
                    <button type="submit" className="w-full py-4 bg-amber-600 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl hover:bg-amber-700 transition">Добавить в каталог</button>
                 </div>
              </form>
              <div className="space-y-3">
                {allProducts.map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-white border border-stone-100 rounded-2xl">
                    <img src={p.image} className="w-10 h-14 object-cover rounded" />
                    <div className="flex-grow min-w-0"><p className="text-xs font-bold text-stone-900 truncate">{p.name}</p></div>
                    <button onClick={() => onDeleteProduct(p.id)} className="text-stone-300 hover:text-red-500"><i className="fa-solid fa-trash-can text-xs"></i></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <p className="text-center text-stone-400 py-20 italic">Заказов пока нет</p>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="bg-white border border-stone-100 rounded-3xl p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-serif font-bold text-lg">Заказ #{order.id}</h4>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{order.createdAt}</p>
                      </div>
                      <select 
                        value={order.status} 
                        onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className={`text-[9px] font-bold uppercase px-3 py-1.5 rounded-full outline-none ring-1 ${order.status === 'delivered' ? 'bg-green-100 text-green-700 ring-green-200' : 'bg-amber-100 text-amber-700 ring-amber-200'}`}
                      >
                        <option value="pending">Принят</option>
                        <option value="preparing">Сборка</option>
                        <option value="shipped">В пути</option>
                        <option value="delivered">Доставлено</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                      <div className="space-y-1">
                        <p className="font-bold text-stone-900">{order.customerName}</p>
                        <p className="text-stone-500">{order.phone}</p>
                        <p className="text-stone-500">{order.district}, {order.address}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-bold text-amber-700">{order.total.toLocaleString()} ₸</p>
                        <p className="text-stone-400 text-[10px] uppercase font-bold">{order.deliveryMethod}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
               <div className="bg-stone-50 p-8 rounded-3xl border border-stone-100">
                  <h3 className="font-serif font-bold text-xl mb-6">Главный баннер</h3>
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                    <img src={currentHeroImage} className="w-full h-full object-cover" />
                  </div>
                  <button onClick={() => onUpdateHeroImage(DEFAULT_HERO_IMAGE)} className="px-6 py-3 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-amber-600 transition">Сбросить фото фона</button>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
