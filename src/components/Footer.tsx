import React, { useState } from 'react';
import { MapPin, Phone, Mail, Instagram, X } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [showLegal, setShowLegal] = useState(false);

  return (
    <footer id="contacto" className="bg-black text-white pt-20 pb-32 md:pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          
          {/* Logo y Descripción */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <span className="text-white font-serif italic text-sm font-black tracking-tighter">RI</span>
              </div>
              <h3 className="text-2xl font-serif italic tracking-tighter uppercase font-bold">
                RORIMPORT
              </h3>
            </div>
            <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed max-w-xs">
              Especialistas en logística de importación y distribución de productos exclusivos en Venezuela. 
              Calidad y compromiso en cada entrega.
            </p>
          </div>

          {/* Canales de Enlace */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4af37]">Canales de Enlace</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#d4af37] transition-all">
                  <Phone size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <a 
                  href="https://wa.me/584224421040" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-400 group-hover:text-white transition-colors tracking-wide"
                >
                  +58 422-4421040
                </a>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center">
                  <MapPin size={14} className="text-gray-500" />
                </div>
                <span className="text-sm text-gray-400 tracking-wide">Operaciones Nacionales | Venezuela</span>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#d4af37] transition-all">
                  <Mail size={14} className="text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <a href="mailto:ventas@rorimport.com" className="text-sm text-gray-400 group-hover:text-white transition-colors tracking-wide">
                  ventas@rorimport.com
                </a>
              </div>
            </div>
          </div>

          {/* Presencia Digital */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4af37]">Presencia Digital</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/rorimport_sp/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-500"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>

            <div className="pt-4">
              <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Horario Operativo</h5>
              <p className="text-gray-500 text-[11px] leading-relaxed italic font-medium">
                Lunes a Viernes: 09:00 - 18:00<br />
              </p>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="border-t border-gray-900 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest text-center md:text-left">
              © {currentYear} RORIMPORT. Excelencia en Importación.
            </p>
            <div className="flex gap-8">
              <button 
                onClick={() => setShowLegal(true)}
                className="text-[9px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors"
              >
                Políticas y Privacidad
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Legal Unificado */}
      {showLegal && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[2rem] p-8 md:p-12 relative shadow-2xl no-scrollbar">
            <button 
              onClick={() => setShowLegal(false)}
              className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-3xl font-serif italic text-white mb-8 uppercase tracking-tighter">Información Legal</h2>
            
            <div className="space-y-8 text-zinc-400 text-[10px] md:text-xs leading-relaxed font-medium uppercase tracking-wider">
              
              <section className="space-y-4">
                <h3 className="text-[#d4af37] font-black tracking-[0.2em] border-b border-zinc-800 pb-2">TÉRMINOS DE SERVICIO</h3>
                <div className="space-y-3">
                  <p><span className="text-white">PROCESO DE COMPRA:</span> Las órdenes se inician en este portal y se finalizan exclusivamente vía WhatsApp para garantizar una atención personalizada y coordinar métodos de pago.</p>
                  <p><span className="text-white">ENTREGAS:</span> RORIMPORT coordina la logística de envío a nivel nacional bajo los tiempos y tarifas acordados durante la confirmación del pedido.</p>
                  <p><span className="text-white">STOCK:</span> La disponibilidad está sujeta a confirmación final. Nos reservamos el derecho de cancelar órdenes si el producto no cumple con nuestros estándares de calidad antes del envío.</p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-[#d4af37] font-black tracking-[0.2em] border-b border-zinc-800 pb-2">POLÍTICA DE PRIVACIDAD</h3>
                <div className="space-y-3">
                  <p><span className="text-white">DATOS:</span> Recopilamos nombre, teléfono y dirección únicamente para la gestión de su pedido. No vendemos ni compartimos su información con terceros ajenos a la operación logística.</p>
                  <p><span className="text-white">SEGURIDAD:</span> Utilizamos infraestructura de Firebase para el resguardo de la base de datos de productos, garantizando la integridad del sistema.</p>
                  <p><span className="text-white">DERECHOS:</span> Para rectificar o eliminar sus datos de nuestros registros de envío, escriba a ventas@rorimport.com.</p>
                </div>
              </section>

            </div>
            
            <div className="mt-10 pt-6 border-t border-zinc-800">
              <button 
                onClick={() => setShowLegal(false)}
                className="w-full py-4 bg-white text-black font-black text-[10px] uppercase tracking-[0.3em] rounded-xl hover:bg-[#d4af37] transition-colors"
              >
                Aceptar y Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
