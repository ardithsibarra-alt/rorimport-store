import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight, Hash } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db } from '../lib/firebase';
import { collection, setDoc, serverTimestamp, doc, runTransaction } from 'firebase/firestore';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
  const { cart, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const [step, setStep] = useState(1);
  const [orderCode, setOrderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    if (isOpen && !orderCode) {
      const num = Math.floor(10000 + Math.random() * 90000);
      setOrderCode(`ROR-N${num}`);
    }
  }, [isOpen, orderCode]);

  if (!isOpen) return null;

  const totalUSD = getTotalPrice();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomerData({ ...customerData, [e.target.name]: e.target.value });
  };

  const processStockUpdate = async (cartItems: any[]) => {
    await runTransaction(db, async (transaction) => {
      const updates = cartItems.map(item => {
        const baseId = item.id.split('-')[0];
        return {
          ref: doc(db, "productos", baseId),
          qty: item.quantity,
          name: item.name
        };
      });

      const snapshots = await Promise.all(updates.map(u => transaction.get(u.ref)));

      snapshots.forEach((snap, index) => {
        if (!snap.exists()) throw new Error(`El producto ${updates[index].name} no existe.`);
        const currentStock = Number(snap.data()?.stock) || 0;
        const requestedQty = updates[index].qty;
        if (currentStock < requestedQty) {
          throw new Error(`Lo sentimos. Solo quedan ${currentStock} unidades de ${updates[index].name}.`);
        }
        transaction.update(updates[index].ref, {
          stock: currentStock - requestedQty
        });
      });
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || loading) return;
    setLoading(true);

    try {
      await processStockUpdate(cart);

      const pedidoRef = doc(db, "pedidos", orderCode);
      
      await setDoc(pedidoRef, {
        id: orderCode,
        codigoPedido: orderCode,
        cliente: {
          nombre: customerData.name,
          telefono: customerData.phone,
          direccion: customerData.address
        },
        items: cart.map(item => ({
          nombre: item.name,
          cantidad: item.quantity,
          precio: item.price,
          talla: item.selectedSize || 'N/A',
          color: item.selectedColor || 'N/A'
        })),
        total: totalUSD,
        fecha: serverTimestamp(),
        status: 'Pendiente',
        tipo: 'Nacional'
      });

      let messageText = `RORIMPORT - NUEVA ORDEN #${orderCode}\n`;
      messageText += `------------------------------------------\n\n`;
      messageText += `CLIENTE: ${customerData.name.toUpperCase()}\n`;
      messageText += `TELÉFONO: ${customerData.phone}\n`;
      messageText += `DIRECCIÓN: ${customerData.address}\n\n`;
      messageText += `DETALLE DEL PEDIDO:\n`;

      cart.forEach((item, index) => {
        messageText += `${index + 1}. ${item.name.toUpperCase()}\n`;
        messageText += `   Cant: ${item.quantity} | Subtotal: $${(item.price * item.quantity).toFixed(2)}\n`;
        if (item.selectedSize && item.selectedSize !== 'N/A') messageText += `   Talla: ${item.selectedSize}\n`;
        if (item.selectedColor && item.selectedColor !== 'N/A') messageText += `   Color: ${item.selectedColor}\n`;
        messageText += `\n`;
      });

      messageText += `------------------------------------------\n`;
      messageText += `TOTAL A PAGAR: $${totalUSD.toFixed(2)}\n\n`;
      messageText += `Por favor, confírmame la disponibilidad para procesar mi pago.`;

      window.open(`https://wa.me/584224421040?text=${encodeURIComponent(messageText)}`, '_blank');

      clearCart();
      setStep(1);
      setOrderCode('');
      onClose();
    } catch (error: any) {
      alert(error.message || "Error al procesar el pedido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>

      <div className="absolute right-0 bottom-0 md:top-0 h-[95vh] md:h-full w-full max-w-md bg-white shadow-2xl rounded-t-[2.5rem] md:rounded-none">
        <div className="flex flex-col h-full">
          <div className="p-6 md:p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-2xl font-serif italic text-black">
              {step === 1 ? 'Selección' : 'Envío'}
            </h2>
            <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full">
              <X size={20} className="text-black" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag size={40} className="text-gray-200 mb-4" />
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">No hay piezas seleccionadas</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32">
                {step === 1 ? (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-20 h-24 bg-zinc-50 rounded-xl overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif italic text-sm text-black">{item.name}</h3>
                            <p className="font-bold text-black text-xs mt-1">${item.price.toFixed(2)}</p>
                            <p className="text-[9px] text-zinc-400 uppercase mt-1">{item.selectedSize} / {item.selectedColor}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-4 bg-zinc-50 rounded-full px-3 py-1">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={10} /></button>
                              <span className="text-xs font-bold">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={10} /></button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-zinc-300 text-[9px] font-black uppercase">Eliminar</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-zinc-50 p-6 rounded-[2rem]">
                      <label className="text-[8px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                        <Hash size={10} /> Order ID
                      </label>
                      <p className="font-serif italic text-xl text-black">{orderCode}</p>
                    </div>
                    <div className="space-y-4">
                      <input type="text" name="name" value={customerData.name} onChange={handleInputChange} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-200" placeholder="Nombre y Apellido" />
                      <input type="tel" name="phone" value={customerData.phone} onChange={handleInputChange} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-200" placeholder="WhatsApp" />
                      <textarea name="address" value={customerData.address} onChange={handleInputChange} className="w-full p-4 bg-zinc-50 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-200 resize-none" placeholder="Dirección de entrega" rows={3} />
                    </div>
                  </div>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-lg border-t border-zinc-100">
                <div className="flex justify-between items-center mb-4 px-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-bold">${totalUSD.toFixed(2)}</span>
                </div>
                {step === 1 ? (
                  <button onClick={() => setStep(2)} className="w-full bg-black text-white py-5 rounded-full font-black text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all">
                    CONFIRMAR DATOS <ArrowRight size={14} />
                  </button>
                ) : (
                  <div className="space-y-3">
                    <button onClick={handleCheckout} disabled={!customerData.name || !customerData.phone || loading} className="w-full bg-black text-white py-5 rounded-full font-black text-[10px] tracking-[0.3em] disabled:bg-zinc-200 active:scale-95 transition-all">
                      {loading ? 'PROCESANDO...' : 'FINALIZAR EN WHATSAPP'}
                    </button>
                    <button onClick={() => setStep(1)} className="w-full text-[9px] font-black text-zinc-400 uppercase text-center">Volver</button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
