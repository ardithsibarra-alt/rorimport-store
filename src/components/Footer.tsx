import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contacto" className="bg-black text-white pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-16">
          
          {/* Logo y Descripción */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {/* LOGO: FONDO NEGRO, BORDE BLANCO */}
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <span className="text-white font-serif italic text-sm font-black tracking-tighter">SP</span>
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
                <a href="tel:+584128209111" className="text-sm text-gray-400 group-hover:text-white transition-colors tracking-wide">
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
                href="#"
                className="w-11 h-11 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-500"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                className="w-11 h-11 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all duration-500"
                aria-label="Facebook"
              >
                <Facebook size={18} />
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
              <a href="#" className="text-[9px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                Términos
              </a>
              <a href="#" className="text-[9px] font-bold text-gray-600 hover:text-white uppercase tracking-widest transition-colors">
                Privacidad
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}