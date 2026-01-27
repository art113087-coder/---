
import React from 'react';
import { CartItem } from '../types';
import { WHATSAPP_NUMBER, TRANSLATIONS } from '../constants';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string, size: string) => void;
  onUpdateQuantity: (id: string, size: string, delta: number) => void;
  lang: string;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemoveItem, onUpdateQuantity, lang }) => {
  const t = TRANSLATIONS[lang];
  const [isCheckout, setIsCheckout] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    address: '',
    delivery: 'yandex',
    payment: 'kaspi'
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalCheckout = () => {
    const paymentLabels: any = {
      kaspi: t.payKaspi,
      cash: t.payCash,
      card: t.payCard
    };

    const deliveryLabels: any = {
      yandex: t.yandexDelivery,
      standard: t.standardDelivery,
      pickup: t.selfPickup
    };

    const header = lang === 'kk' ? 'ЖАҢА ТАПСЫРЫС (Zhumagul)' : lang === 'ky' ? 'ЖАҢЫ ЗАКАЗ (Zhumagul)' : 'НОВЫЙ ЗАКАЗ (Zhumagul)';
    
    const message = encodeURIComponent(
      `🛍 *${header}*\n\n` +
      `👤 *Клиент:* ${formData.name}\n` +
      `📞 *Телефон:* ${formData.phone}\n` +
      `🚚 *Доставка:* ${deliveryLabels[formData.delivery]}\n` +
      `📍 *Адрес:* ${formData.address}\n` +
      `💳 *Оплата:* ${paymentLabels[formData.payment]}\n\n` +
      `👗 *Товары:*\n` +
      items.map(item => `• ${item.name} (${item.selectedSize}) x${item.quantity} - ${item.price * item.quantity} ₸`).join('\n') +
      `\n\n💰 *ИТОГО:* ${total.toLocaleString('ru-RU')} ₸`
    );
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setIsCheckout(false), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            {isCheckout && (
              <button onClick={() => setIsCheckout(false)} className="w-8 h-8 rounded-full hover:bg-stone-100 transition flex items-center justify-center">
                <i className="fa-solid fa-arrow-left text-sm"></i>
              </button>
            )}
            <h2 className="text-xl font-serif font-bold text-stone-800">
              {isCheckout ? t.checkout : t.cart}
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800 transition">
            <i className="fa-solid fa-xmark text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto">
          {!isCheckout ? (
            // Cart View
            <div className="p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-4 py-32">
                  <i className="fa-solid fa-bag-shopping text-6xl opacity-10"></i>
                  <p className="text-lg font-serif italic">{t.emptyCart}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 border-b border-stone-50 pb-6 group">
                      <div className="w-24 h-32 flex-shrink-0 overflow-hidden rounded shadow-sm">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="flex-grow flex flex-col">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-stone-800 text-sm leading-tight pr-4">{item.name}</h4>
                          <button onClick={() => onRemoveItem(item.id, item.selectedSize)} className="text-stone-300 hover:text-red-500 transition">
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1 uppercase font-bold tracking-widest">{item.selectedSize}</p>
                        <div className="flex justify-between items-end mt-auto">
                          <div className="flex items-center border border-stone-100 rounded-full bg-stone-50">
                            <button onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-800 transition">-</button>
                            <span className="px-1 text-[10px] font-bold min-w-[20px] text-center">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)} className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-800 transition">+</button>
                          </div>
                          <p className="font-bold text-amber-700 text-sm">{(item.price * item.quantity).toLocaleString('ru-RU')} ₸</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Checkout Form
            <div className="p-8 space-y-8 animate-fade-in pb-12">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{t.fullName}</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Алтынай Смагулова"
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{t.phone}</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+7 (777) 000 00 00"
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none shadow-inner"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{t.deliveryMethod}</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'yandex', label: t.yandexDelivery, icon: 'fa-taxi', color: 'bg-yellow-400', hint: t.yandexHint },
                      { id: 'standard', label: t.standardDelivery, icon: 'fa-truck-fast', color: 'bg-blue-600' },
                      { id: 'pickup', label: t.selfPickup, icon: 'fa-shop', color: 'bg-stone-800' }
                    ].map(method => (
                      <label 
                        key={method.id}
                        className={`flex flex-col gap-1 p-4 rounded-xl border cursor-pointer transition ${formData.delivery === method.id ? 'border-amber-600 bg-amber-50' : 'border-stone-100 hover:border-stone-200'}`}
                      >
                        <input 
                          type="radio" 
                          name="delivery" 
                          value={method.id}
                          checked={formData.delivery === method.id}
                          onChange={handleInputChange}
                          className="hidden" 
                        />
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${formData.delivery === method.id ? method.color : 'bg-stone-100 text-stone-400'}`}>
                            <i className={`fa-solid ${method.icon}`}></i>
                          </div>
                          <span className={`text-xs font-bold ${formData.delivery === method.id ? 'text-stone-900' : 'text-stone-500'}`}>{method.label}</span>
                          {formData.delivery === method.id && <i className="fa-solid fa-circle-check text-amber-600 ml-auto"></i>}
                        </div>
                        {method.hint && (
                          <p className="text-[9px] text-stone-400 ml-14 mt-1 font-medium italic">{method.hint}</p>
                        )}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">
                    {formData.delivery === 'pickup' ? t.addressLabel : t.deliveryAddress}
                  </label>
                  <textarea 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder={formData.delivery === 'pickup' ? 'Бутик Zhumagul, Автонур' : 'Район Аль-Фараби, ул. Желтоксан...'}
                    className="w-full px-5 py-4 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none h-24 resize-none shadow-inner"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-stone-400">{t.paymentMethod}</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'kaspi', label: t.payKaspi, icon: 'fa-qrcode' },
                      { id: 'cash', label: t.payCash, icon: 'fa-money-bill-wave' },
                      { id: 'card', label: t.payCard, icon: 'fa-credit-card' }
                    ].map(method => (
                      <label 
                        key={method.id}
                        className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${formData.payment === method.id ? 'border-amber-600 bg-amber-50' : 'border-stone-100 hover:border-stone-200'}`}
                      >
                        <input 
                          type="radio" 
                          name="payment" 
                          value={method.id}
                          checked={formData.payment === method.id}
                          onChange={handleInputChange}
                          className="hidden" 
                        />
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.payment === method.id ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                          <i className={`fa-solid ${method.icon}`}></i>
                        </div>
                        <span className={`text-xs font-bold ${formData.payment === method.id ? 'text-stone-900' : 'text-stone-500'}`}>{method.label}</span>
                        {formData.payment === method.id && <i className="fa-solid fa-circle-check text-amber-600 ml-auto"></i>}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-stone-100 bg-white shrink-0 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t.total}</span>
              <span className="text-2xl font-serif font-bold text-stone-900">{total.toLocaleString('ru-RU')} ₸</span>
            </div>
            
            {!isCheckout ? (
              <button 
                onClick={() => setIsCheckout(true)} 
                className="w-full py-5 bg-stone-900 text-white font-bold uppercase text-xs tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:bg-amber-800 transition shadow-lg active:scale-[0.98]"
              >
                {t.orderWhatsApp} <i className="fa-solid fa-arrow-right"></i>
              </button>
            ) : (
              <button 
                onClick={handleFinalCheckout} 
                disabled={!formData.name || !formData.phone || (!formData.address && formData.delivery !== 'pickup')}
                className="w-full py-5 bg-green-600 text-white font-bold uppercase text-xs tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:bg-green-700 transition shadow-lg active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <i className="fa-brands fa-whatsapp text-lg"></i> {t.completeOrder}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
