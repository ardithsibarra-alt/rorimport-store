import { ShoppingCart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import CartModal from './CartModal';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasBanner, setHasBanner] = useState(false);
  const { getTotalItems } = useCart();

  const robotoStyle = { fontFamily: "'Roboto Condensed'" };

  useEffect(() => {
    // Reemplazo de onSnapshot por consulta a Supabase
    const checkBanner = async () => {
      const { data, error } = await supabase
        .from('configuracion')
        .select('bannerTexto')
        .eq('id', 'tienda')
        .single();

      if (!error && data) {
        setHasBanner(!!data.bannerTexto);
      }
    };

    checkBanner();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = isScrolled ? 60 : 100; 
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  const menuItems = [
    { name: 'Inicio', id: 'inicio' },
    { name: 'Colección', id: 'productos' },
    { name: 'Importaciones', id: 'encargos' },
    { name: 'Contacto', id: 'contacto' },
  ];

  return (
    <>
      {/* Spacer para evitar que el contenido se suba */}
      <div className={`${isScrolled ? 'h-[64px]' : hasBanner ? 'h-[104px]' : 'h-[74px]'}`} />

      <header 
        className={`fixed left-0 right-0 z-[1000] transition-all duration-300 ${
          isScrolled 
            ? 'top-0 bg-white/90 backdrop-blur-md shadow-sm' 
            : `${hasBanner ? 'top-[44px] md:top-[40px]' : 'top-0'} bg-white`
        } text-black border-b border-gray-100`}
      >
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* LOGO */}
            <div 
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => scrollToSection('inicio')}
            >
              <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center font-serif italic text-white transform group-hover:scale-105 transition-all">
                <span className="text-xs font-black tracking-tighter" style={robotoStyle}>SP</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black italic tracking-tighter leading-none" style={robotoStyle}>
                  RORIMPORT
                </h1>
                <span className="text-[7px] font-bold tracking-[0.4em] text-gray-400 uppercase" style={robotoStyle}>Since 2024</span>
              </div>
            </div>

            {/* NAV DESKTOP */}
            <nav className="hidden md:flex items-center space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-[10px] font-black uppercase tracking-[0.2em] hover:text-gray-400 transition-all"
                  style={robotoStyle}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* ACCIONES */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-black text-white rounded-full active:scale-90 transition-all"
              >
                <ShoppingCart size={18} strokeWidth={2.5} />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2.5 bg-gray-100 rounded-full text-black active:scale-90 transition-all z-[1001]"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      <div className={`fixed inset-0 bg-white z-[999] flex flex-col transition-all duration-500 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col items-start justify-center h-full px-10 gap-8">
          <span className="text-gray-300 text-[10px] font-black tracking-[0.5em] uppercase" style={robotoStyle}>Menú</span>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="text-5xl font-black italic tracking-tighter uppercase text-left active:text-gray-400 transition-colors"
              style={robotoStyle}
            >
              {item.name}
            </button>
          ))}
          <div className="w-full h-[1px] bg-gray-100 my-4" />
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-yellow-400 rounded-full text-[10px] font-black uppercase tracking-widest">Nueva Colección</div>
          </div>
        </div>
      </div>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
