import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { ShoppingBag, Globe, ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  const [mensajeBanner, setMensajeBanner] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "configuracion", "tienda"), (docSnap) => {
      if (docSnap.exists()) {
        setMensajeBanner(docSnap.data().bannerTexto || docSnap.data().mensaje);
      }
    });
    return () => unsubscribe();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      window.scrollTo({
        top: element.getBoundingClientRect().top + window.pageYOffset - offset,
        behavior: 'smooth'
      });
    }
  };

  // Definimos la fuente limpia (Sans Serif) para asegurar que no use la de antes
  const seriousFont = { fontFamily: "'Inter', sans-serif" };

  return (
    <section id="inicio" className="relative min-h-[85vh] flex items-center bg-black text-white overflow-hidden">
      
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col gap-12">
          
          <div className="max-w-5xl animate-in fade-in slide-in-from-top duration-1000">
            {mensajeBanner ? (
              <div className="inline-block">
                <div className="flex items-center gap-3 mb-6 text-[#d4af37]">
                  <Sparkles size={18} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em]">Exclusividad al alcance de tus manos</span>
                </div>
                {/* Texto imponente, sin colitas y en mayúsculas */}
                <h2 
  style={seriousFont}
  className="text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-none tracking-tighter text-white mb-6 whitespace-nowrap"
>
  {mensajeBanner}
</h2>
                <div className="w-24 h-[2px] bg-[#d4af37]"></div>
              </div>
            ) : (
              <div>
                <h1 
                  style={seriousFont}
                  className="text-6xl md:text-9xl font-black uppercase tracking-tighter mb-2"
                >
                  RORIMPORT
                </h1>
                <p className="text-[#d4af37] text-xs font-black uppercase tracking-[0.6em]">Luxury Procurement</p>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
            <button 
              onClick={() => scrollToSection('productos')}
              className="group flex flex-col items-start p-10 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white hover:text-black transition-all duration-700 text-left"
            >
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                <ShoppingBag size={20} />
              </div>
              <h3 style={seriousFont} className="text-2xl font-bold uppercase tracking-tight mb-2">Catálogo de Productos</h3>
              <p className="text-[10px] opacity-50 mb-8 font-bold uppercase tracking-widest">Entrega inmediata en el país</p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                Ver Catálogo <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </button>

            <button 
              onClick={() => scrollToSection('encargos')}
              className="group flex flex-col items-start p-10 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-[#d4af37] hover:text-black transition-all duration-700 text-left"
            >
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                <Globe size={20} />
              </div>
              <h3 style={seriousFont} className="text-2xl font-bold uppercase tracking-tight mb-2">Encargos Internacionales</h3>
              <p className="text-[10px] opacity-50 mb-8 font-bold uppercase tracking-widest">Realiza tus pedidos desde Venezuela</p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em]">
                Cotizar Pieza <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          </div>

        </div>
      </div>

      <div className="absolute right-0 top-0 h-full w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent hidden lg:block"></div>
    </section>
  );
}