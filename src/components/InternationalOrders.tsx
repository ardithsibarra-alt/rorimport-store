import React, { useState, useEffect } from 'react';
import { Send, Link as LinkIcon, User, MapPin, Phone, Hash, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function InternationalOrders() {
  const [orderCode, setOrderCode] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    phone: '',
    address: '',
    link: ''
  });

  useEffect(() => {
    // Generamos el código con el prefijo "I" para que el Admin lo reconozca como Internacional
    const num = Math.floor(10000 + Math.random() * 90000);
    setOrderCode(`ROR-I${num}`);
  }, []);

  const isFormValid = 
    formData.fullName.trim().length > 3 && 
    formData.idNumber.trim().length > 5 && 
    formData.phone.trim().length >= 10 && 
    formData.link.includes('http') &&
    formData.address.trim().length > 15;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    
    try {
      // Usamos insert de Supabase para registrar el pedido
      const { error } = await supabase
        .from('pedidos')
        .insert([{
          id: orderCode,
          codigo_pedido: orderCode,
          cliente: {
            nombre: formData.fullName,
            cedula: formData.idNumber,
            telefono: formData.phone,
            direccion: formData.address,
          },
          items: [{
            nombre: `ENCARGO INTERNACIONAL`,
            url: formData.link,
            cantidad: 1,
            precio: 0 
          }],
          total: 0,
          referencia: "COTIZACIÓN PENDIENTE",
          status: 'Pendiente',
          tipo: 'Internacional',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      const message = encodeURIComponent(
        `RORIMPORT - SOLICITUD DE IMPORTACIÓN\n` +
        `--------------------------\n` +
        `TRACKING ID: #${orderCode}\n` +
        `CLIENTE: ${formData.fullName.toUpperCase()}\n` +
        `CÉDULA: ${formData.idNumber}\n` +
        `TELÉFONO: ${formData.phone}\n` +
        `DIRECCIÓN: ${formData.address}\n` +
        `LINK PRODUCTO: ${formData.link}\n` +
        `--------------------------\n` +
        `Solicito presupuesto formal de importación y logística.`
      );
      
      window.open(`https://wa.me/584128209111?text=${message}`, '_blank');
      
      // Resetear formulario y generar nuevo código
      setFormData({ fullName: '', idNumber: '', phone: '', address: '', link: '' });
      const nextNum = Math.floor(10000 + Math.random() * 90000);
      setOrderCode(`ROR-I${nextNum}`);

    } catch (error) {
      console.error(error);
      alert("Error en el registro del pedido internacional.");
    }
  };

  return (
    <section id="encargos" className="py-24 bg-white border-t border-gray-50">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-10 text-center border-b border-gray-50 bg-[#FAFAFA]">
            <h3 className="text-3xl font-serif italic text-black tracking-tight">Pedidos Internacionales</h3>
            <p className="text-gray-400 text-[9px] font-bold uppercase tracking-[0.4em] mt-3">Gestión de compras globales a tu medida</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <label className="block text-[8px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2 tracking-[0.2em]">
                <Hash className="w-3 h-3 text-black" /> Número de Seguimiento (Auto)
              </label>
              <input
                type="text"
                value={orderCode}
                readOnly
                className="w-full bg-transparent text-black font-serif italic text-2xl outline-none cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                  <User size={12} /> Nombre Completo
                </label>
                <input
                  required
                  type="text"
                  value={formData.fullName}
                  className="w-full px-0 py-3 border-b border-gray-200 focus:border-black outline-none transition-all bg-transparent text-sm"
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-black uppercase tracking-widest">Documento de Identidad</label>
                <input
                  required
                  type="text"
                  value={formData.idNumber}
                  className="w-full px-0 py-3 border-b border-gray-200 focus:border-black outline-none transition-all bg-transparent text-sm"
                  onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                  <Phone size={12} /> WhatsApp de Contacto
                </label>
                <input
                  required
                  type="tel"
                  placeholder="04xx-xxxxxxx"
                  value={formData.phone}
                  className="w-full px-0 py-3 border-b border-gray-200 focus:border-black outline-none transition-all bg-transparent text-sm"
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                  <LinkIcon size={12} /> Enlace del Producto
                </label>
                <input
                  required
                  type="url"
                  placeholder="https://..."
                  value={formData.link}
                  className="w-full px-0 py-3 border-b border-gray-200 focus:border-black outline-none transition-all bg-transparent text-sm italic text-gray-400"
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-bold text-black uppercase tracking-widest flex items-center gap-2">
                <MapPin size={12} /> Dirección y Referencia de Entrega
              </label>
              <textarea
                required
                rows={2}
                value={formData.address}
                className="w-full px-0 py-3 border-b border-gray-200 focus:border-black outline-none resize-none text-sm bg-transparent transition-all"
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              ></textarea>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-full py-5 rounded-full font-bold text-[10px] tracking-[0.4em] shadow-sm transform transition-all flex items-center justify-center gap-3 
                  ${isFormValid 
                    ? 'bg-black text-white hover:bg-gray-900 hover:-translate-y-1' 
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
              >
                <Send size={14} />
                {isFormValid ? 'PROCESAR SOLICITUD' : 'REVISAR DATOS'}
              </button>

              <div className="mt-10 flex items-start gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <Info size={18} className="text-black shrink-0" />
                <div>
                  <p className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-2">Protocolo de Importación</p>
                  <p className="text-[11px] text-gray-500 leading-relaxed italic">
                    Nuestra oficina técnica procesará los costos de nacionalización y manejo logístico para enviarle la cotización final a su numero de contacto.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
