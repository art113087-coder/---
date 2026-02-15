
import React from 'react';
import { CartItem, District, Order } from '../types';
import { WHATSAPP_NUMBER, TRANSLATIONS, SHYMKENT_DISTRICTS } from '../constants';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemoveItem: (id: string, size: string) => void;
  onUpdateQuantity: (id: string, size: string, delta: number) => void;
  onPlaceOrder: (order: Order) => void;
  lang: string;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, items, onRemoveItem, onUpdateQuantity, onPlaceOrder, lang }) => {
  const t = TRANSLATIONS[lang];
  const [isCheckout, setIsCheckout] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    district: SHYMKENT_DISTRICTS[0].name,
    delivery: 'yandex',
    payment: 'kaspi'
  });

  const selectedDistrictData = SHYMKENT_DISTRICTS.find(d => d.name === formData.district) || SHYMKENT_DISTRICTS[0];
  const shippingCost = formData.delivery === 'pickup' ? 0 : selectedDistrictData.price;
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFinalCheckout = () => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      customerName: formData.name,
      customerEmail: formData.email,
      phone: formData.phone,
      items: [...items],
      total: total,
      district: formData.district,
      address: formData.address,
      deliveryMethod: formData.delivery,
      status: 'pending',
      createdAt: new Date().toLocaleString()
    };

    onPlaceOrder(newOrder);

    // Симуляция отправки чека
    alert(`${t.receiptSent} (${formData.email})`);

    const message = encodeURIComponent(
      `🛍 *ЗАКАЗ #${orderId}*\n\n` +
      `👤 *Клиент:* ${formData.name}\n` +
      `📧 *Email:* ${formData.email}\n` +
      `📞 *Телефон:* ${formData.phone}\n` +
      `🏢 *Район:* ${formData.district}\n` +
      `📍 *Адрес:* ${formData.address}\n` +
      `🚚 *Доставка:* ${formData.delivery === 'yandex' ? 'Яндекс Go' : formData.delivery === 'pickup' ? 'Самовывоз' : 'Курьер'}\n` +
      `💳 *Оплата:* ${formData.payment}\n\n` +
      `👗 *Товары:*\n` +
      items.map(item => `• ${item.name} (${item.selectedSize}) x${item.quantity}`).join('\n') +
      `\n\n💰 *ИТОГО:* ${total.toLocaleString('ru-RU')} ₸`
    );
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left overflow-hidden">
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            {isCheckout && <button onClick={() => setIsCheckout(false)} className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center"><i className="fa-solid fa-arrow-left text-sm"></i></button>}
            <h2 className="text-xl font-serif font-bold text-stone-800">{isCheckout ? t.checkout : t.cart}</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800 transition"><i className="fa-solid fa-xmark text-2xl"></i></button>
        </div>

        <div className="flex-grow overflow-y-auto">
          {!isCheckout ? (
            <div className="p-6">
              {items.length === 0 ? (
                <div className="py-32 text-center text-stone-300">
                  <i className="fa-solid fa-bag-shopping text-6xl mb-4 opacity-10"></i>
                  <p className="font-serif italic text-lg">Ваша корзина пуста</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-4 border-b border-stone-50 pb-6 group">
                      <div className="w-20 h-28 flex-shrink-0 overflow-hidden rounded bg-stone-50">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow flex flex-col">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-stone-800 text-sm leading-tight">{item.name}</h4>
                          <button onClick={() => onRemoveItem(item.id, item.selectedSize)} className="text-stone-300 hover:text-red-500"><i className="fa-solid fa-trash-can text-xs"></i></button>
                        </div>
                        <p className="text-[10px] text-amber-600 font-bold mt-1">РАЗМЕР: {item.selectedSize}</p>
                        <div className="flex justify-between items-end mt-auto">
                          <div className="flex items-center border border-stone-100 rounded-full bg-stone-50 h-8">
                            <button onClick={() => onUpdateQuantity(item.id, item.selectedSize, -1)} className="w-8 h-full text-stone-400">-</button>
                            <span className="px-1 text-[10px] font-bold min-w-[20px] text-center">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.id, item.selectedSize, 1)} className="w-8 h-full text-stone-400">+</button>
                          </div>
                          <p className="font-bold text-stone-900 text-sm">{(item.price * item.quantity).toLocaleString('ru-RU')} ₸</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 space-y-6 animate-fade-in">
              <div className="space-y-4">
                <input name="name" value={formData.name} onChange={handleInputChange} placeholder={t.fullName} className="w-full px-5 py-4 bg-stone-50 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500" />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t.email} className="w-full px-5 py-4 bg-stone-50 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500" />
                <input name="phone" value={formData.phone} onChange={handleInputChange} placeholder={t.phone} className="w-full px-5 py-4 bg-stone-50 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500" />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t.deliveryMethod}</label>
                <div className="grid grid-cols-1 gap-2">
                  {['yandex', 'standard', 'pickup'].map(method => (
                    <label key={method} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${formData.delivery === method ? 'border-amber-600 bg-amber-50' : 'border-stone-100'}`}>
                      <input type="radio" name="delivery" value={method} checked={formData.delivery === method} onChange={handleInputChange} className="hidden" />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.delivery === method ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                        <i className={`fa-solid ${method === 'yandex' ? 'fa-taxi' : method === 'pickup' ? 'fa-shop' : 'fa-truck'}`}></i>
                      </div>
                      <span className="text-xs font-bold">{method === 'yandex' ? t.yandexDelivery : method === 'pickup' ? t.selfPickup : t.standardDelivery}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formData.delivery !== 'pickup' && (
                <div className="space-y-4 animate-fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{t.districtLabel}</label>
                  <select name="district" value={formData.district} onChange={handleInputChange} className="w-full px-5 py-4 bg-stone-50 rounded-xl text-sm outline-none border border-transparent focus:border-amber-500">
                    {SHYMKENT_DISTRICTS.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
                  </select>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex justify-between items-center">
                    <div className="text-[10px] font-bold text-amber-800">
                      <p>{t.shippingPrice} {selectedDistrictData.price} ₸</p>
                      <p>{t.estTime} {selectedDistrictData.estimatedTime}</p>
                    </div>
                    <i className="fa-solid fa-taxi text-amber-600"></i>
                  </div>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder={t.deliveryAddress} className="w-full px-5 py-4 bg-stone-50 rounded-xl text-sm outline-none h-24 resize-none border border-transparent focus:border-amber-500" />
                </div>
              )}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-stone-100 bg-white shrink-0">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <span>Товары:</span>
                <span>{subtotal.toLocaleString('ru-RU')} ₸</span>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <span>Логистика:</span>
                <span>{shippingCost.toLocaleString('ru-RU')} ₸</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-stone-900 uppercase tracking-widest">{t.total}:</span>
                <span className="text-2xl font-serif font-bold text-stone-900">{total.toLocaleString('ru-RU')} ₸</span>
              </div>
            </div>
            
            {!isCheckout ? (
              <button onClick={() => setIsCheckout(true)} className="w-full py-5 bg-stone-900 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-amber-800 transition shadow-lg">
                Оформить доставку <i className="fa-solid fa-arrow-right ml-2"></i>
              </button>
            ) : (
              <button onClick={handleFinalCheckout} disabled={!formData.name || !formData.phone || !formData.email} className="w-full py-5 bg-green-600 text-white font-bold uppercase text-xs tracking-widest rounded-xl hover:bg-green-700 transition shadow-lg disabled:opacity-30">
                <i className="fa-brands fa-whatsapp mr-2 text-lg"></i> {t.completeOrder}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
