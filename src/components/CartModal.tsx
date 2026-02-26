import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, ArrowRight, User, Hash } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { db } from '../lib/firebase';
import { collection, setDoc, serverTimestamp, doc, runTransaction } from 'firebase/firestore'; // Cambiado addDoc por setDoc

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
      setOrderCode(`ROR-N${num}`); // Aquí generamos el prefijo N de Nacional
    }
  }, [isOpen]);

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
        if (!snap.exists()) throw `El producto ${updates[index].name} no existe.`;
        const currentStock = Number(snap.data().stock) || 0;
        const requestedQty = updates[index].qty;
        if (currentStock < requestedQty) {
          throw `Lo sentimos. Solo quedan ${currentStock} unidades de ${updates[index].name}.`;
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

      // Usamos setDoc con orderCode para que el ID del documento sea ROR-NXXXXX
      const pedidoRef = doc(db, "pedidos", orderCode);
      
      await setDoc(pedidoRef, {
        id: orderCode, // Guardamos el ID explícito para el Admin
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
        total: totalUSD, // CAMBIADO: Antes era totalUSD, ahora es 'total' para que el Admin lo lea
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
    <div className="fixed inset-0 z-[150] overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl">
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif italic text-black">
                {step === 1 ? 'Selección' : 'Envío'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-all">
                <X size={20} className="text-black" />
              </button>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag size={40} className="text-gray-100 mb-4" />
              <p className="text-gray-300 font-bold uppercase text-[10px] tracking-[0.3em]">No hay piezas seleccionadas</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-8">
                {step === 1 ? (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 group">
                        <div className="w-20 h-24 bg-[#F9F9F9] rounded-lg overflow-hidden shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                          <div>
                            <h3 className="font-serif italic text-sm text-black mb-1">{item.name}</h3>
                            <p className="font-bold text-black text-sm">${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 border border-gray-100 rounded-md px-2 py-1">
                              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="hover:text-black text-gray-400">
                                <Minus size={12} />
                              </button>
                              <span className="text-[10px] font-bold w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="hover:text-black text-gray-400">
                                <Plus size={12} />
                              </button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-black text-[9px] font-bold uppercase tracking-widest transition-all">Eliminar</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      <label className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Hash size={10} /> Order ID
                      </label>
                      <p className="font-serif italic text-xl text-black">{orderCode}</p>
                    </div>
                    <div className="space-y-6">
                      <input type="text" name="name" value={customerData.name} onChange={handleInputChange} className="w-full py-3 border-b border-gray-200 focus:border-black outline-none bg-transparent text-sm" placeholder="Nombre y Apellido" />
                      <input type="tel" name="phone" value={customerData.phone} onChange={handleInputChange} className="w-full py-3 border-b border-gray-200 focus:border-black outline-none bg-transparent text-sm" placeholder="WhatsApp" />
                      <textarea name="address" value={customerData.address} onChange={handleInputChange} className="w-full py-3 border-b border-gray-200 focus:border-black outline-none bg-transparent text-sm resize-none" placeholder="Dirección de entrega" rows={2} />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-[#F9F9F9] border-t border-gray-100">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Total Selección:</span>
                  <span className="text-3xl font-bold text-black">${totalUSD.toFixed(2)}</span>
                </div>

                {step === 1 ? (
                  <button onClick={() => setStep(2)} className="w-full bg-black text-white py-5 rounded-full font-bold text-[10px] tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-gray-900 transition-all shadow-lg">
                    Confirmar Datos <ArrowRight size={14} />
                  </button>
                ) : (
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={handleCheckout} 
                      disabled={!customerData.name || !customerData.phone || loading} 
                      className="w-full bg-black text-white py-5 rounded-full font-bold text-[10px] tracking-[0.3em] disabled:bg-gray-200 transition-all shadow-lg"
                    >
                      {loading ? 'Procesando...' : 'Finalizar en WhatsApp'}
                    </button>
                    <button onClick={() => setStep(1)} className="text-[9px] font-bold text-gray-400 uppercase tracking-widest hover:text-black">Volver al carrito</button>
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